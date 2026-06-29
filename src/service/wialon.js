const WialonService = (() => {
  let session = null;
  let initialized = false;

  const HOST = "https://hst-api.wialon.com";

  function init() {
    if (initialized) return;
    session = wialon.core.Session.getInstance();
    session.initSession(HOST);
    initialized = true;
  }

  function login(token) {
    return new Promise((resolve, reject) => {
      init();

      session.loginToken(token, "", (code) => {
        if (code) {
          return reject(wialon.core.Errors.getErrorText(code));
        }

        resolve({
          user: session.getCurrUser().getName(),
          id: session.getCurrUser().getId(),
        });
      });
    });
  }

  function logout() {
    return new Promise((resolve) => {
      session.logout(() => {
        resolve(true);
      });
    });
  }

  function loadUnits() {
    return new Promise((resolve, reject) => {
      const flags =
        wialon.item.Item.dataFlag.base |
        wialon.item.Item.dataFlag.customFields |
        wialon.item.Item.dataFlag.adminFields |
        wialon.item.Unit.dataFlag.lastMessage;

      session.loadLibrary("itemCustomFields");

      session.updateDataFlags(
        [
          {
            type: "type",
            data: "avl_unit",
            flags,
            mode: 0,
          },
        ],
        (code) => {
          if (code) return reject(code);

          const units = session.getItems("avl_unit") || [];

          const result = units.map((u) => {

            const p = u.getPosition();
            const flds = u.getCustomFields();

            return {
              id: u.getId(),
              name: u.getName(),
              lat: p?.y,
              lon: p?.x,
              speed: p?.s,
              velocidad: p?.s,
              timestamp: p?.t,
              fields_customers: flds,
            };
          });

          resolve(result);
        }
      );
    });
  }

  function getSid() {
    return session.getId();
  }

  function getServerTime() {
    return session.getServerTime();
  }

  function getSession() {
    return session;
  }

  async function loadGroupsWithUnits(groups_filter = []) {
    return new Promise((resolve, reject) => {
      const session = wialon.core.Session.getInstance();

      const unitFlags =
        wialon.item.Item.dataFlag.base |
        wialon.item.Unit.dataFlag.sensors |
        wialon.item.Item.dataFlag.messages |
        wialon.item.Resource.dataFlag.base |
        wialon.item.Resource.dataFlag.reports |
        wialon.item.Item.dataFlag.adminFields |
        wialon.item.Unit.dataFlag.lastMessage |
        wialon.item.Item.dataFlag.customFields |
        wialon.item.Resource.dataFlag.notifications;

      session.loadLibrary("itemIcon");
      session.loadLibrary("unitSensors");
      session.loadLibrary("resourceReports");
      session.loadLibrary("itemCustomFields");
      session.loadLibrary("resourceNotifications");

      const groupFlags =
        wialon.item.Item.dataFlag.base;

      session.updateDataFlags(
        [
          { type: "type", data: "avl_unit", flags: unitFlags, mode: 0 },
          { type: "type", data: "avl_resource", flags: unitFlags, mode: 0 },
          { type: "type", data: "avl_unit_group", flags: groupFlags, mode: 0 },
        ],
        (code) => {
          if (code) return reject(code);

          const resource = session.getItems("avl_resource") || [];
          const groups = session.getItems("avl_unit_group") || [];

          const result = groups.filter(group => groups_filter.some(f => group.getName().includes(f))).map(group => {
            const units = group.getUnits() || [];
            const parsedUnits = units.map((_u) => {
              const u = session.getItem(_u);
              const p = u.getPosition();
              const sens = u.getSensors();
              const flds = u.getCustomFields();
              const lastMessage = u.getLastMessage();

              return {
                id: u.getId(),
                name: u.getName(),
                Unidad: u.getName(),
                icon: u.getIconUrl(32),
                Latitud: p?.y,
                Longitud: p?.x,
                speed: p?.s,
                Velocidad: p?.s,
                timestamp: p?.t,
                Voltaje: 0,
                Online: 0,
                fields_customers: flds,
                sens,
                lastMessage,
              };
            });

            return {
              group_id: group.getId(),
              group_name: group.getName(),
              units: parsedUnits,
            };
          });

          getNotifications(resource);
          resolve(result);
        }
      );
    });
  }

  async function getCustomFields(id_unit) {
    const unit = session.getItem(id_unit);
    const custom_fields = unit.getCustomFields();

    console.log(custom_fields);


  }

  async function updateCustomField({ id_unit, field_id, field_name, field_new_value }) {

    return new Promise((resolve, reject) => {

      const unit = session.getItem(id_unit);
      const unit_name = unit.getName();

      if (!unit) {
        return reject('Unidad no encontrada');
      }

      unit.updateCustomField({
        id: field_id,
        n: field_name,
        v: field_new_value
      }, (code) => {

        if (code !== 0) {
          return reject(wialon.core.Errors.getErrorText(code));
        }

        resolve({
          unit_name,
          success: true,
          code
        });

      }
      );

    });

  }

  async function getSensor(id_unit, sensorNames) {

    return new Promise((resolve, reject) => {

      const unit = session.getItem(id_unit);

      if (!unit) {
        return reject(new Error("Unidad no encontrada"));
      }

      const sensors = unit.getSensors();

      const names = (Array.isArray(sensorNames)
        ? sensorNames
        : [sensorNames]
      ).map(name => name.toUpperCase());

      for (const key in sensors) {

        if (!Object.hasOwn(sensors, key)) continue;

        const sensor = sensors[key];

        if (
          names.includes(
            sensor.n.toUpperCase()
          )
        ) {
          return resolve(sensor);
        }

      }

      reject(sensors);

    });

  }

  async function getLastMessages(id_unit) {
    const to = session.getServerTime();
    const from = to - (3600 * 5);

    const message_loader = session.getMessagesLoader();

    return new Promise((resolve, reject) => {

      message_loader.loadInterval(id_unit, from, to, 0, 0, 10000000, (code, data) => {
        if (code) {
          return reject(wialon.core.Errors.getErrorText(code));
        }
        resolve(data);
      }
      );
    });
  }

  async function getDirection(lat, lng) {
    return new Promise((resolve, reject) => {
      wialon.util.Gis.getLocations([{ lon: lng, lat: lat }], function (code, address) {
        if (code) {
          return reject((wialon.core.Errors.getErrorText(code)));
        }
        resolve(address);
      });
    })
  }

  function getNotifications(res) {

    for (var i = 0; i < res.length; i++) {
      res[i].addListener("messageRegistered", processNotification);
    }
  }

  function processNotification(event) {
    const data = event.getData(); // get data from event
    const unit = session.getItem(data.unit);

    if (data.tp && data.tp == "unm") {
      // addNotificationToast(unit, data)
      // console.log(data);
      if (data.name == 'DEV-VAR-TEMP') {
        // console.log(data);
        addNotificationToast(unit, data)
      }
    }
  }

  function addNotificationToast(unit, data) {
    $("#root-toast").html(
      `<div class="toast-header">
          <img src="${unit.getIconUrl(32)}" class="rounded me-2" width="45" alt="...">
          <strong class="me-auto fs-4">${unit.getName()}</strong>
          <small class="text-muted">Ahora mismo</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body p-3">
          <p class="fw-bold fs-5 mb-1">${data.name}</p>
          <hr class="my-1">
          <p class="text-muted fs-6 mb-0">${data.txt}</p>
      </div>`
    )

    showToast('#root-toast')
  }

  function showToast(idToast) {
    const toastElement = $(idToast);
    const toastInstance = new bootstrap.Toast(toastElement);
    toastInstance.show();
  }

  /* Ejecutar reporte */
  function getReportAccount(name_account, name_report) {
    return new Promise((resolve, reject) => {
      const resource = session.getItems("avl_resource");

      for (const account of resource) {
        if (account.$$user_name === name_account) {
          const reports = account.getReports();

          for (const key in reports) {
            if (!Object.hasOwn(reports, key)) continue;

            const report = reports[key];

            if (report.n === name_report) {
              report["id_account"] = account._id;
              resolve(report);
            }
          }
        }
      }
    });
  }

  function execReport(data) {

    return new Promise((resolve, reject) => {

      const { id_report, id_account, id_unit } = data;

      const to = session.getServerTime();
      const from = to - 604800;

      wialon.core.Remote.getInstance().remoteCall(
        "report/exec_report",
        {
          reportResourceId: id_account,
          reportTemplateId: id_report,
          reportObjectId: id_unit,
          reportObjectSecId: 0,
          interval: {
            from,
            to,
            flags: wialon.item.MReport.intervalFlag.absolute
          }
        },
        (code, result) => {

          if (code) {
            return reject(
              wialon.core.Errors.getErrorText(code)
            );
          }

          resolve(result);

        }
      );

    });

  }

  function getResultTables() {
    return new Promise((resolve, reject) => {

      wialon.core.Remote.getInstance().remoteCall(
        "report/get_result_tables",
        {},
        (code, tables) => {

          if (code) {
            return reject(
              wialon.core.Errors.getErrorText(code)
            );
          }

          resolve(tables);

        }
      );

    });
  }

  function getReportRowsRemote({ tableIndex = 0, indexFrom = 0, indexTo = 1000, }) {

    return new Promise((resolve, reject) => {

      wialon.core.Remote.getInstance().remoteCall(
        "report/get_result_rows",
        {
          tableIndex,
          indexFrom,
          indexTo
        },
        (code, data) => {
          if (code) {
            return reject(
              wialon.core.Errors.getErrorText(code)
            );
          }

          resolve(data);
        }
      );

    });

  }

  function getReportSubRows({ tableIndex, rowIndex }) {
    return new Promise((resolve, reject) => {
      wialon.core.Remote.getInstance().remoteCall(
        "report/get_result_subrows",
        {
          tableIndex,
          rowIndex    // ← solo estos dos
        },
        (code, data) => {
          if (code) return reject(wialon.core.Errors.getErrorText(code));
          resolve(data);
        }
      );
    });
  }

  function getReportSubRowsDetail({ tableIndex, rowIndex, indexFrom, indexTo }) {
    return new Promise((resolve, reject) => {
      wialon.core.Remote.getInstance().remoteCall(
        "report/get_result_subrows",
        {
          tableIndex,
          rowIndex,
          indexFrom,
          indexTo
        },
        (code, data) => {
          if (code) return reject(wialon.core.Errors.getErrorText(code));
          resolve(data);
        }
      );
    });
  }

  function selectResultRows({ tableIndex, config }) {
    return new Promise((resolve, reject) => {
      wialon.core.Remote.getInstance().remoteCall(
        "report/select_result_rows",
        {
          tableIndex,
          config   // define el rango de filas a obtener
        },
        (code, data) => {
          if (code) return reject(wialon.core.Errors.getErrorText(code));
          resolve(data);
        }
      );
    });
  }

  return {
    login,
    logout,
    getSid,
    loadUnits,
    getSensor,
    getSession,
    getDirection,
    getServerTime,
    getCustomFields,
    getNotifications,
    getLastMessages,
    updateCustomField,
    loadGroupsWithUnits,
  };
})();
