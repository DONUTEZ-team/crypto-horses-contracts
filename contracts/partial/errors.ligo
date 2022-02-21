module Game is {
  const err_unknown_func       : string = "100";
  const err_cant_unpack_lambda : string = "101";
  const err_high_func_index    : string = "102";
  const err_func_set           : string = "103";
}

module Common is {
  const err_not_admin         : string = "200";
  const err_not_pending_admin : string = "201";
}

module UbineticProxy is {
  const err_ubinetic_get_current_epoch_view_404 : string = "300";
  const err_ubinetic_get_entropy_view_404       : string = "301";
}

module RandomizerProxy is {
  const err_randomizer_get_random_between_entropy_bytes_view_404 : string = "400";
}

module Horse is {
  const err_bet_betting_part_not_started : string = "500";
  const err_bet_horse_not_found : string = "501";
}
