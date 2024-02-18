/* Magic Mirror
 * Module: MMM-CANVAS
 *
 * By Dan R.
 *
 */
const NodeHelper = require('node_helper');
var smallpayload = [
    ["", "", ""],
];
var finalpayload = [
    ["", ""],
];
module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getCANVAS: function(payload) {
        var key = payload[0];
        var coursesOld = payload[1];
        var urlbase = payload[2];
        var count = 0;
        var self = this;
        var courses = [];

        getCourses();
        var timer = setInterval(function() {
            if (count == courses.length) {
                self.sendSocketNotification('CANVAS_RESULT', finalpayload);
                finalpayload = [
                    ["", ""],
                ];
                smallpayload = [
                    ["", ""],
                ];
                count = 0;
            }
        }, 400);

        function getCourses() {
            var url = "https://"+ urlbase +"/api/v1/courses?access_token=" + key + "&per_page=30&enrollment_state=active";
            fetch(url, {
                method: "GET"
            })
            .then(response => console.log(response.status) || response) // output the status and return response
            .then(response => response.json()) 
            .then(result => {
                for (var j in result) {
                    runCourses(j.id);
                }
            });
        }

        function runCourses(courseId) {
            var url = "https://"+ urlbase +"/api/v1/courses/" + courseId + "/assignments?access_token=" + key + "&per_page=30&bucket=upcoming&order_by=due_at";
            fetch(url, {
                method: "GET"
            })
            .then(response => console.log(response.status) || response) // output the status and return response
            .then(response => response.json()) 
            .then(result => {
                for (var j in result) {
                    smallpayload.push([result[j].name, result[j].due_at, index]);
                }
                finalpayload.push(smallpayload);
                count++;
            });
        }
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_CANVAS') {
            this.getCANVAS(payload);
        }
    }
});
