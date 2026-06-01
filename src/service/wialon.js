
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

  async function loadGroupsWithUnits(groups_filter = []) {
    return new Promise((resolve, reject) => {
      const session = wialon.core.Session.getInstance();

      const unitFlags =
        wialon.item.Item.dataFlag.base |
        wialon.item.Unit.dataFlag.sensors |
        wialon.item.Item.dataFlag.adminFields |
        wialon.item.Item.dataFlag.customFields |
        wialon.item.Unit.dataFlag.lastMessage;

      session.loadLibrary("itemIcon");
      session.loadLibrary("unitSensors");
      session.loadLibrary("itemCustomFields");

      const groupFlags =
        wialon.item.Item.dataFlag.base;

      session.updateDataFlags(
        [
          { type: "type", data: "avl_unit", flags: unitFlags, mode: 0 },
          { type: "type", data: "avl_unit_group", flags: groupFlags, mode: 0 },
        ],
        (code) => {
          if (code) return reject(code);

          const groups = session.getItems("avl_unit_group") || [];
          const result = groups
            .filter(group =>
              groups_filter.some(f => group.getName().includes(f))
            )
            .map(group => {
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
        },(code) => {

          if (code !== 0) {
            return reject( wialon.core.Errors.getErrorText(code) );
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

  return {
    login,
    logout,
    loadUnits,
    getCustomFields,
    updateCustomField,
    loadGroupsWithUnits,
  };
})();
