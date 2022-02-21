type token_id is nat
type race_id is nat
type amt is nat
type horse_id is nat

type account is record [
  balance : map(token_id, nat);
  allowances : set(address);
  reward : map(race_id, bool);
]

type token_metadata_info is record [
  token_id : token_id;
  extras : map(string, bytes);
]

type token_info_t       is record [
  name                    : string;
  lvl                     : nat;
  speed                   : nat;
  stamina                 : nat;
  age                     : timestamp;
  race_counter            : nat;
  last_race               : timestamp;
  in_race                 : bool;
]

type race_t             is [@layout:comb] record [
  participants_count      : nat;
  max_participants_count  : nat;
  betting_start           : timestamp;
  random                  : nat;
  race_start              : timestamp;
]

type storage            is record [
  admin                   : address;
  admin_reward_flag       : map(race_id, bool);
  ledger                  : big_map(address, account);
  token_info              : big_map((address * token_id), token_info_t);
  token_metadata          : big_map(token_id, token_metadata_info);
  races                   : big_map(race_id, race_t);
  free_token              : set(address);
  pools                   : big_map(race_id, nat); // (race_id, pool)
  bets                    : big_map((address * race_id), map(horse_id, amt));
  uusd_token              : address;
  ubinetic_proxy          : address;
  randomizer_proxy        : address;
  metadata                : big_map(string, bytes);
  lastTokenId             : nat;
]

type return is list (operation) * storage

type transfer_destination is [@layout:comb] record [
  to_ : address;
  token_id : token_id;
  amount : nat;
]

type transfer_param is [@layout:comb] record [
  from_ : address;
  txs : list(transfer_destination);
]

type balance_of_request is [@layout:comb] record [
  owner : address;
  token_id : token_id;
]

type balance_of_response is [@layout:comb] record [
  request : balance_of_request;
  balance : nat;
]

type balance_params is [@layout:comb] record [
  requests : list(balance_of_request);
  callback : contract(list(balance_of_response));
]

type operator_param is [@layout:comb] record [
  owner : address;
  operator : address;
  token_id : token_id;
]

type update_operator_param is
| Add_operator of operator_param
| Remove_operator of operator_param

type transfer_params is list(transfer_param)

type update_operator_params is list(update_operator_param)

type token_action is
| Transfer of transfer_params
| Balance_of of balance_params
| Update_operators of update_operator_params
| Mint_token of mint_token_params
| Bet of bet_t

[@inline] const noOperations : list(operation) = nil;
