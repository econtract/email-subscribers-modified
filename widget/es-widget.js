// For Widget
function es_submit_page(e, url) {

    jQuery('#thankYouPopup').modal({show: false});

    // Finding the active Form - from where the button is clicked
    e = e || window.event;
    var target = e.target || e.srcElement;
    var es_widget_form = target.parentElement;

    while (es_widget_form.nodeName !== 'FORM') {
        es_widget_form = es_widget_form.parentElement;
    }

    if (typeof es_widget_form !== 'undefined' && es_widget_form !== '') {
        var es_email = es_widget_form.querySelector("input[name=es_txt_email]");
        var es_name = es_widget_form.querySelector("input[name=es_txt_name]");
        var es_group = es_widget_form.querySelector("input[name=es_txt_group]");

        if (es_email.value == "") {

            bootbox.alert({
                title: "Error!",
                message: es_widget_notices.es_email_notice,
                size: 'small',
                callback: function () {
                    es_email.focus();
                }
            });

            // alert(es_widget_notices.es_email_notice);

            return false;
        }

        if (es_email.value != "" && ( es_email.value.indexOf("@", 0) == -1 || es_email.value.indexOf(".", 0) == -1 )) {
            // alert(es_widget_notices.es_incorrect_email);

            bootbox.alert({
                title: "Error!",
                message: es_widget_notices.es_incorrect_email,
                size: 'small',

                callback: function () {
                    es_email.focus();
                    es_email.select();
                }
            });

            /*			es_email.focus();
                        es_email.select();*/
            return false;
        }

        var es_msg = es_widget_form.querySelector("#es_msg") || '';
        /*es_msg.innerHTML = es_widget_notices.es_load_more;*/


        var date_now = "";
        var mynumber = Math.random();
        var str = "es_email=" + encodeURIComponent(es_email.value) + "&es_name=" + encodeURIComponent(es_name.value) + "&es_group=" + encodeURIComponent(es_group.value) + "&timestamp=" + encodeURIComponent(date_now) + "&action=" + encodeURIComponent(mynumber);

        es_submit_request(url + '/?es=subscribe', str, es_widget_form); // Passing the form to the submit request
    }

}

var http_req = false;

function es_submit_request(url, parameters, es_widget_form) {
    http_req = false;
    if (window.XMLHttpRequest) {
        http_req = new XMLHttpRequest();
        if (http_req.overrideMimeType) {
            http_req.overrideMimeType('text/html');
        }
    } else if (window.ActiveXObject) {
        try {
            http_req = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                http_req = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {

            }
        }
    }
    if (!http_req) {
        // alert(es_widget_notices.es_ajax_error);
        bootbox.alert({
            title: "Error!",
            message: es_widget_notices.es_ajax_error,
            size: 'small'
        });
        return false;
    }

    http_req.onreadystatechange = function () {
        eemail_submitresult(es_widget_form)
    };	// Passing the form to the submit request
    http_req.open('POST', url, true);
    http_req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // http_req.setRequestHeader("Content-length", parameters.length);
    // http_req.setRequestHeader("Connection", "close");
    http_req.send(parameters);
}

function eemail_submitresult(es_widget_form) {
    if (http_req.readyState == 4) {
        if (http_req.status == 200) {
            if (http_req.readyState == 4 || http_req.readyState == "complete") {
                if (typeof es_widget_form !== 'undefined') {
                    var es_email = es_widget_form.querySelector("input[name=es_txt_email]");
                    var es_name = es_widget_form.querySelector("input[name=es_txt_name]");
                    var es_msg = es_widget_form.querySelector("#es_msg") || '';
                    var es_msg_text = '';
                    var esSuccessEvent = new CustomEvent("es_response", {
                        detail: {
                            es_response: "error",
                            msg: ''
                        },
                        bubbles: true,
                        cancelable: true
                    });

                    if ((http_req.responseText).trim() == "subscribed-successfully") {
                        es_msg_text = es_widget_notices.es_success_message;
                        esSuccessEvent.detail.es_response = 'success';
                        es_email.value = "";
                        es_name.value = "";
                    } else if ((http_req.responseText).trim() == "subscribed-pending-doubleoptin") {
                        // alert(es_widget_notices.es_success_notice);
                        esSuccessEvent.detail.es_response = 'success';
                        es_msg_text = es_widget_notices.es_success_message;
                        es_email.value = "";
                        es_name.value = "";
                    } else if ((http_req.responseText).trim() == "already-exist") {
                        es_msg_text = es_widget_notices.es_email_exists;
                    } else if ((http_req.responseText).trim() == "unexpected-error") {
                        es_msg_text = es_widget_notices.es_error;
                    } else if ((http_req.responseText).trim() == "invalid-email") {
                        es_msg_text = es_widget_notices.es_invalid_email;
                    } else {
                        es_msg_text = es_widget_notices.es_try_later;
                    }


                    if (esSuccessEvent.detail.es_response === "success") {
                        jQuery('#registerNewsletterPopup').modal('hide');
                        jQuery('#thankYouNLPopup').modal('show');

                    }
                    else {

                        bootbox.alert({
                            title: "Error!",
                            message: es_msg_text,
                            size: 'small'
                        });

                    }

                    //es_msg.innerHTML = es_msg_text;
                    //esSuccessEvent.detail.msg = es_msg_text;
                    es_widget_form.dispatchEvent(esSuccessEvent); // Trigger ES-Success Event
                }
            }
        } else {
            alert(es_widget_notices.es_problem_request);
        }
    }
}

//Polyfill for ie
(function () {
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();