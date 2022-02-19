#include "../partial/errors.ligo"

#include "../partial/common_types.ligo"

#include "../partial/utils.ligo"

#include "../partial/common_helpers.ligo"

#include "../partial/randomizer_proxy/randomizer_proxy_types.ligo"
#include "../partial/randomizer_proxy/randomizer_proxy_views.ligo"
#include "../partial/randomizer_proxy/randomizer_proxy_methods.ligo"

function main(
  const action          : action_t;
  const s               : storage_t)
                        : return_t is
  case action of
  | Set_admin(admin)              -> set_admin(admin, s)
  | Confirm_admin                 -> confirm_admin(s)
  | Change_randomizer(randomizer) -> change_randomizer(
                                      randomizer, s
                                    )
  end
