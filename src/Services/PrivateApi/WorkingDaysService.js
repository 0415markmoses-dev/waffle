import Http from "../Http.js";

/* example response :
{
    "@context": "\/api\/contexts\/WorkingHours",
    "@id": "\/api\/working_hours",
    "@type": "Collection",
    "totalItems": 7,
    "member": [
        {
            "@id": "\/api\/working_hours\/monday",
            "@type": "WorkingHours",
            "id": "monday",
            "details": [
                {
                    "from": "08:00",
                    "to": 750
                },
                {
                    "from": 810,
                    "to": 1020
                }
            ]
        },
        {
            "@id": "\/api\/working_hours\/tuesday",
            "@type": "WorkingHours",
            "id": "tuesday",
            "details": [
                {
                    "from": "08:00",
                    "to": 750
                },
                {
                    "from": 810,
                    "to": 1020
                }
            ]
        },
        {
            "@id": "\/api\/working_hours\/wednesday",
            "@type": "WorkingHours",
            "id": "wednesday",
            "details": [
                {
                    "from": "08:00",
                    "to": 750
                },
                {
                    "from": 810,
                    "to": 1020
                }
            ]
        },
        {
            "@id": "\/api\/working_hours\/thursday",
            "@type": "WorkingHours",
            "id": "thursday",
            "details": [
                {
                    "from": "08:00",
                    "to": 750
                },
                {
                    "from": 810,
                    "to": 1020
                }
            ]
        },
        {
            "@id": "\/api\/working_hours\/friday",
            "@type": "WorkingHours",
            "id": "friday",
            "details": [
                {
                    "from": "08:00",
                    "to": 750
                },
                {
                    "from": 810,
                    "to": 1020
                }
            ]
        },
        {
            "@id": "\/api\/working_hours\/saturday",
            "@type": "WorkingHours",
            "id": "saturday",
            "details": []
        },
        {
            "@id": "\/api\/working_hours\/sunday",
            "@type": "WorkingHours",
            "id": "sunday",
            "details": []
        }
    ]
}
 */

const WorkingDaysService = {
    _workingDays: null,
    getWorkingDays: function (getParams = {}) {
        if (this._workingDays !== null) {
            return Promise.resolve(this._workingDays);
        }
        return Http.get('/api/working_hours', {
            params: {
                ...getParams,
            }
        }).then(response => {
            this._workingDays = response.data.member;
            return response.data.member;
        });
    },
    getWorkingDayBetween: function (startDate, endDate) {
        // use WorkingDaysService.getWorkingDays to get the working days of the company
        return this.getWorkingDays()
            .then(workingDays => {
                let workingDaysCount = 0;
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    let dayOfWeek = currentDate.getDay();
                    if (workingDays[dayOfWeek].details.length > 0) {
                        workingDaysCount++;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                return workingDaysCount;
            });
    }
}

export default WorkingDaysService;
