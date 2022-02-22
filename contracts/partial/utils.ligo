module Constants is {
  const zero_address : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg" : address);

  const default_account : account_t = record [
    allowances = (Set.empty : set(address));
  ];

  const default_token_info : token_info_t = record [
    name         = "Undefined";
    lvl          = 0n;
    speed        = 1n;
    stamina      = 100n;
    age          = (Tezos.now : timestamp);
    race_counter = 0n;
    last_race    = (0 : timestamp);
    in_race      = False;
  ];
}
