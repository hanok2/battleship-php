/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.4.1
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2013, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.timeago = function(timestamp) {
        if (timestamp instanceof Date) {
            return inWords(timestamp);
        } else if (typeof timestamp === "string") {
            return inWords($.timeago.parse(timestamp));
        } else if (typeof timestamp === "number") {
            return inWords(new Date(timestamp));
        } else {
            return inWords($.timeago.datetime(timestamp));
        }
    };
    var $t = $.timeago;

    $.extend($.timeago, {
        settings: {
            refreshMillis: 1000,
            allowPast: true,
            allowFuture: true,
            localeTitle: true,
            isFuture: false,
            showSec: true,
            cutoff: 0,
            strings: {
                prefixAgo: null,
                prefixFromNow: null,
                suffixAgo: "ago",
                suffixFromNow: "",
                inPast: 'any moment now',
                lessMinute: "less than a minute",
                seconds: "%d seconds",
                second: "%d second",
                minute: "about a minute",
                minutes: "%d minutes",
                hour: "about an hour",
                hours: "about %d hours",
                day: "a day",
                days: "%d days",
                month: "about a month",
                months: "%d months",
                year: "about a year",
                years: "%d years",
                wordSeparator: " ",
                numbers: []
            },
            onComplete: function() { }
        },

        inWords: function(distanceMillis) {
            var $l = this.settings.strings;
            var prefix = $l.prefixAgo;
            var suffix = $l.suffixAgo;
            if (distanceMillis < 0) {
                prefix = $l.prefixFromNow;
                suffix = $l.suffixFromNow;
                this.settings.isFuture = true;
            } else {
                this.settings.isFuture = false;
            }

            var seconds = Math.abs(distanceMillis) / 1000;
            var minutes = seconds / 60;
            var hours = minutes / 60;
            var days = hours / 24;
            var years = days / 365;

            function substitute(stringOrFunction, number) {
                var str = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
                var value = ($l.numbers && $l.numbers[number]) || number;
                return str.replace(/%d/i, value);
            }

            if (distanceMillis > 0) {
                var words = seconds < 45 && substitute($l.lessMinute, Math.round(seconds)) ||
                    seconds < 90 && substitute($l.minute, 1) ||
                    minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
                    minutes < 90 && substitute($l.hour, 1) ||
                    hours < 24 && substitute($l.hours, Math.round(hours)) ||
                    hours < 42 && substitute($l.day, 1) ||
                    days < 30 && substitute($l.days, Math.round(days)) ||
                    days < 45 && substitute($l.month, 1) ||
                    days < 365 && substitute($l.months, Math.round(days / 30)) ||
                    years < 1.5 && substitute($l.year, 1) ||
                    substitute($l.years, Math.round(years));
            } else {
                distanceMillis /= -1000;
                var words = [];

                // Complete
                if (distanceMillis < 1) {
                    this.settings.onComplete();
                    return $l.now;
                }

                // Year
                if ((3600 * 24 * 365) <= distanceMillis) {
                    years = Math.floor(distanceMillis / (3600 * 24 * 365));
                    if (years == 1) {
                        words.push(substitute($l.year, 1));
                    } else {
                        words.push(substitute($l.years, years));
                    }
                    distanceMillis -= 3600 * 24 * 365 * years;
                }

                // Month
                if ((3600 * 24 * 30) <= distanceMillis) {
                    month = Math.floor(distanceMillis / (3600 * 24 * 30));
                    if (month == 1) {
                        words.push(substitute($l.month, 1));
                    } else {
                        words.push(substitute($l.months, month));
                    }
                    distanceMillis -= 3600 * 24 * 30 * month;
                }

                // Day
                if ((3600 * 24) <= distanceMillis) {
                    days = Math.floor(distanceMillis / (3600 * 24));
                    if (days == 1) {
                        words.push(substitute($l.day, 1));
                    } else {
                        words.push(substitute($l.days, days));
                    }
                    distanceMillis -= 3600 * 24 * days;
                }

                // Hours
                if (3600 <= distanceMillis) {
                    hours = Math.floor(distanceMillis / 3600);
                    if (hours == 1) {
                        words.push(substitute($l.hour, 1));
                    } else {
                        words.push(substitute($l.hours, hours));
                    }
                    distanceMillis -= 3600 * hours;
                }

                // Minutes
                if (60 <= distanceMillis) {
                    minutes = Math.floor(distanceMillis / 60);
                    if (minutes == 1) {
                        words.push(substitute($l.minute, 1));
                    } else {
                        words.push(substitute($l.minutes, minutes));
                    }
                    distanceMillis -= 60 * minutes;
                }

                // Seconds
                if (this.settings.showSec && 1 <= distanceMillis) {
                    seconds = Math.floor(distanceMillis);
                    if (seconds == 1) {
                        words.push(substitute($l.second, 1));
                    } else {
                        words.push(substitute($l.seconds, seconds));
                    }
                }
                words = words.join(', ');
            }

            var separator = $l.wordSeparator || "";
            if ($l.wordSeparator === undefined) { separator = " "; }
            return $.trim([prefix, words, suffix].join(separator));
        },

        parse: function(iso8601) {
            var s = $.trim(iso8601);
                s = s.replace(/\.\d+/,""); // remove milliseconds
                s = s.replace(/-/,"/").replace(/-/,"/");
                s = s.replace(/T/," ").replace(/Z/," UTC");
                s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
                s = s.replace(/([\+\-]\d\d)$/," $100"); // +09 -> +0900
            return new Date(s);
        },
        datetime: function(elem) {
            var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
            return $t.parse(iso8601);
        },
        isTime: function(elem) {
            // jQuery's `is()` doesn't play well with HTML5 in IE
            return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
        }
    });

    // functions that can be called via $(el).timeago('action')
    // init is default when no action is given
    // functions are called with context of a single element
    var functions = {
        init: function(){
            var refresh_el = $.proxy(refresh, this);
            refresh_el();
            var $s = $t.settings;
            this._timeagoInterval = setInterval(refresh_el, $s.refreshMillis);
        },
        update: function(time){
            var parsedTime = $t.parse(time);
            $(this).data('timeago', { datetime: parsedTime });
            if($t.settings.localeTitle) $(this).attr("title", parsedTime.toLocaleString());
            refresh.apply(this);
        },
        updateFromDOM: function(){
            $(this).data('timeago', { datetime: $t.parse( $t.isTime(this) ? $(this).attr("datetime") : $(this).attr("title") ) });
            refresh.apply(this);
        },
        dispose: function () {
            if (this._timeagoInterval) {
                window.clearInterval(this._timeagoInterval);
                this._timeagoInterval = null;
            }
        },
        reload: function(interval) {
            window.clearInterval(this._timeagoInterval);
            var refresh_el = $.proxy(refresh, this);
            refresh_el();
            this._timeagoInterval = setInterval(refresh_el, interval);
        },
        onComplete: function(cb) {
           $t.settings.onComplete = cb;
        }
    };

    $.fn.timeago = function(action, options) {
        var fn = action ? functions[action] : functions.init;
        if(!fn){
            throw new Error("Unknown function name '"+ action +"' for timeago");
        }
        // each over objects here and call the requested function
        this.each(function(){
            fn.call(this, options);
        });
        return this;
    };

    function refresh() {
        //check if it's still visible
        if(!$.contains(document.documentElement,this)){
            //stop if it has been removed
            $(this).timeago("dispose");
            return this;
        }

        var data = prepareData(this);
        var $s = $t.settings;

        if (!isNaN(data.datetime)) {
            if ( $s.cutoff == 0 || Math.abs(distance(data.datetime)) < $s.cutoff) {
                $(this).text(inWords(data.datetime));
            }
        }

        var changeFuture = false;
        if ($s.isFuture && $s.refreshMillis !== 1000) {
            $s.refreshMillis = 1000;
            changeFuture = true;
        } else if (!$s.isFuture && $s.refreshMillis !== 60000) {
            $s.refreshMillis = 60000;
            changeFuture = true;
        }

        if (changeFuture) {
            window.clearInterval(this._timeagoInterval);
            var refresh_el = $.proxy(refresh, this);
            this._timeagoInterval = setInterval(refresh_el, $s.refreshMillis);
        }

        return this;
    }

    function prepareData(element) {
        element = $(element);
        if (!element.data("timeago")) {
            element.data("timeago", { datetime: $t.datetime(element) });
            var text = $.trim(element.text());
            if ($t.settings.localeTitle) {
                element.attr("title", element.data('timeago').datetime.toLocaleString());
            } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
                element.attr("title", text);
            }
        }
        return element.data("timeago");
    }

    function inWords(date) {
        return $t.inWords(distance(date));
    }

    function distance(date) {
        return (new Date().getTime() - date.getTime());
    }

    // fix for IE6 suckage
    document.createElement("abbr");
    document.createElement("time");
}));
