#include "../partial/errors.ligo"

#include "../partial/common_types.ligo"

#include "../partial/utils.ligo"

#include "../partial/common_helpers.ligo"

#include "../partial/bets/bets_types.ligo"
#include "../partial/fa2/fa2_types.ligo"

#include "../partial/fa2/fa2_methods.ligo"
#include "../partial/bets/bets_methods.ligo"

function main(const action : token_action; var s : storage) : return is
  case action of
  | Transfer(params) -> ((nil : list(operation)), List.fold(iterate_transfer, params, s))
  | Balance_of(params) -> (get_balance_of(params, s), s)
  | Update_operators(params) -> ((nil : list(operation)), List.fold(iterate_update_operator, params, s))
  | Mint_token(params) -> mint_token(params, s)
  | Bet(params) -> bet(params, s)
  end;
