#include "../partial/errors.ligo"

#include "../partial/game/fa2/fa2_types.ligo"

#include "../partial/common_types.ligo"

#include "../partial/utils.ligo"

#include "../partial/common_helpers.ligo"

#include "../partial/game/game_types.ligo"
#include "../partial/game/game_helpers.ligo"
#include "../partial/game/game_methods.ligo"
#include "../partial/game/game_lambdas.ligo"

#include "../partial/game/fa2/fa2_lambdas.ligo"

function main(
  const action          : full_action_t;
  const s               : full_storage_t)
                        : full_return_t is
  case action of
  | Use(params)        -> call_game(params, s)
  | Setup_func(params) -> setup_func(params, s)
  end
