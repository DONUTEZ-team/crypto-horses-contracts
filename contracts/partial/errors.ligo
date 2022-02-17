module Game is {
  const err_ubinetic_get_current_epoch_view_404                  : string = "100";
  const err_ubinetic_get_entropy_view_404                        : string = "101";
  const err_randomizer_get_random_between_entropy_bytes_view_404 : string = "102";
  const err_unknown_func                                         : string = "103";
  const err_cant_unpack_lambda                                   : string = "104";
  const err_high_func_index                                      : string = "105";
  const err_func_set                                             : string = "106";
}

module Common is {
  const err_not_admin         : string = "200";
  const err_not_pending_admin : string = "201";
}
