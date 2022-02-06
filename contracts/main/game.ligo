#include "../partial/errors.ligo"

#include "../partial/common_types.ligo"

#include "../partial/utils.ligo"

#include "../partial/common_helpers.ligo"

#include "../partial/game/game_types.ligo"
#include "../partial/game/game_methods.ligo"

function main(
  const action          : action_t;
  const s               : storage_t)
                        : return_t is
  case action of
  | Test -> test(Unit, s)
  end
