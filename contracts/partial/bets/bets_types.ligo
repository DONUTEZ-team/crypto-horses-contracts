type mint_token_params is [@layout:comb] record [
  name           : string;
  metadata_param : map(string, bytes);
]

type bet_t              is [@layout:comb] record [
  race_id                 : nat;
  hrs_id                  : nat;
  amt                     : nat;
]

type claim_t            is [@layout:comb] record [
  race_id                 : nat;
]