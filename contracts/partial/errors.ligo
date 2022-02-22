module Game is {
  const err_unknown_func                  : string = "100";
  const err_cant_unpack_lambda            : string = "101";
  const err_high_func_index               : string = "102";
  const err_func_set                      : string = "103";
  const err_too_low_registration_start    : string = "104";
  const err_too_low_betting_start         : string = "105";
  const err_to_low_race_start             : string = "106";
  const err_user_already_got_a_free_horse : string = "107";
}

module Common is {
  const err_not_admin         : string = "200";
  const err_not_pending_admin : string = "201";
  const err_not_a_nat         : string = "202";
}

module UbineticProxy is {
  const err_ubinetic_get_current_epoch_view_404 : string = "300";
  const err_ubinetic_get_entropy_view_404       : string = "301";
}

module RandomizerProxy is {
  const err_randomizer_get_random_between_entropy_bytes_view_404 : string = "400";
}
