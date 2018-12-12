exports.menu = {
    button: [{
            'name': '全有周边',
            'sub_button': [{
                    'name': '小程序',
                    'type': 'click',
                    'key': 'mini_clicked'
                },
                {
                    'name': '勾搭我',
                    'type': 'click',
                    'key': 'contact'
                }
            ]
        },
        {
            'name': '个人中心',
            'type': 'view',
            'url': 'www.aichihua.com'
        },
        {
            'name': '冰火家族',
            'type': 'location_select',
            'key': 'location'
        }
    ]
}