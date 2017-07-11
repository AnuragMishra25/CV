/**
 * Script: utility.js
 * Author: Anurag Mishra
 * Date : 08/04/2017
 * Description : Helper file for carrying out utilities around application
 */

function getError(responseText, responseJSON) {
    let message  = ERROR_MESSAGE.NETWORK_ERROR + responseText.status;
    if (responseJSON.hasOwnProperty("error")) {
        if (responseJSON.hasOwnProperty("message")) {
            message = responseJSON.message
        }
    }
    return message;
}

function objectToQueryString(data){
    let queryString = "";
    let dataKeys = Object.keys(data);
    for (let i = 0; i < dataKeys.length; i++) {
        let lastElement = (i === (dataKeys.length - 1));
        let dataKey = dataKeys[i];
        let dataValue = data[dataKey];
        if (Array.isArray(dataValue)) {
            for (let j = 0; j < dataValue.length; j++) {
                queryString += dataKey + "=" + dataValue[j];

                if (j !== (dataValue.length - 1)) {
                    queryString += "&";
                } else {
                    if (!lastElement) {
                        queryString += "&";
                    }
                }
            }
        } else {
            queryString += dataKey + "=" + dataValue;
            if (!lastElement) {
                queryString += "&";
            }
        }
    }
    return queryString;
}

var Ajax=(function(){

    return{
        get:function (url, params){
                if (params) {
                    url += "?" + objectToQueryString(params);
                }
                // var xmlHttp = new XMLHttpRequest();
                // xmlHttp.open( "GET", endpoint, true ); // false for synchronous request
                // xmlHttp.send( null );
                // return xmlHttp.responseText;
                let options = {
                    method: "GET",
                };
                return window.fetch(url, options);
            },
        post:function(url, data){
                let options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                };

                if (data) {
                    options.body = objectToQueryString(data);
                }

                return window.fetch(url, options);
            }
    }

})();