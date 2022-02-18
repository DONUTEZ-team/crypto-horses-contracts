#include "../partial/errors.ligo"

#include "../partial/common_types.ligo"

#include "../partial/utils.ligo"

#include "../partial/common_helpers.ligo"

#include "../partial/ubinetic_proxy/ubinetic_proxy_types.ligo"
#include "../partial/ubinetic_proxy/ubinetic_proxy_views.ligo"
#include "../partial/ubinetic_proxy/ubinetic_proxy_methods.ligo"

function main(
  const action          : action_t;
  const s               : storage_t)
                        : return_t is
  case action of
  | Set_admin(admin)          -> set_admin(admin, s)
  | Confirm_admin             -> confirm_admin(s)
  | Change_ubinetic(ubinetic) -> change_ubinetic(ubinetic, s)
  end
