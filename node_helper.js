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
        var self = this;

        var url = "https://"+ urlbase +"/api/v1/courses?access_token=" + key + "&per_page=30&enrollment_state=active";
        fetch(url).then(response => response.json()) 
        .then(courseResult => {
            for (const course of courseResult) {
                var course_url = "https://"+ urlbase +"/api/v1/courses/" + course.id + "/assignments?access_token=" + key + "&per_page=30&bucket=upcoming&order_by=due_at";
                fetch(course_url).then(response => response.json()) 
                .then(assignmentResult => {
                    for (var assignment of assignmentResult) {
                        smallpayload.push([assignment.name, assignment.due_at, course.id]);
                    }
                    finalpayload.push(smallpayload);
                });
            }
        }).then(self.sendSocketNotification('CANVAS_RESULT', finalpayload));
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_CANVAS') {
            this.getCANVAS(payload);
        }
    }
});
