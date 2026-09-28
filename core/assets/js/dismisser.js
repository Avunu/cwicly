jQuery(function ($) {
    $(document).on('click', '.notice-cwicly .notice-dismiss, .notice-cwicly .button:not(.button-primary)', function () {
        $.ajax(ajaxurl, {
            type: 'POST',
            data: {
                action: 'cc_dismissed_notice_handler',
                nonce: cwiclyNotice.nonce,
            },
        }).done(function () {
            $(".notice-cwicly").slideUp();
        }).fail(function () {
            $(".notice-cwicly").removeClass("is-dismissible").addClass("notice-error");
        });
    });
});
