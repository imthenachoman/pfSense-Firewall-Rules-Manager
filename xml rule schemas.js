const RULE_PROPERTY_XML_TYPE = {
    BOOL: "bool",
    VALUE: "value",
    CHILD: "child",
    CDATA: "cdata",
    ORDER: "order",
    CUSTOM: "custom"
}

const _rulePropertyXMLSchema_ = {
    "Order": {
        "path": "",
        "type": RULE_PROPERTY_XML_TYPE.ORDER
    },
    "Action": {
        "path": "type",
        "options": ["block", "pass", "reject"],
        "type": RULE_PROPERTY_XML_TYPE.VALUE,
    },
    "Disabled": {
        "path": "disabled",
        "type": RULE_PROPERTY_XML_TYPE.BOOL,
    },
    "Interface": "interface",
    "Address Family": {
        "path": "ipprotocol",
        "options": ["inet", "inet6", "inet46"],
        "type": RULE_PROPERTY_XML_TYPE.VALUE,
    },
    "Protocol": {
        "path": "protocol",
        "options": ["any", "tcp", "udp", "tcp/udp", "icmp", "esp", "ah", "gre", "ipv6", "igmp", "pim", "ospf", "sctp", "carp", "pfsync"],
        "type": RULE_PROPERTY_XML_TYPE.VALUE,
        "default": "any",
    },
    "ICMP Type": "icmptype",
    "Source Type": {
        "path": "source",
        "options": ["any", "address", "network"],
        "type": RULE_PROPERTY_XML_TYPE.CHILD,
    },
    "Not From Source": {
        "path": "source/not",
        "type": RULE_PROPERTY_XML_TYPE.BOOL,
    },
    "Source": {
        "path": "source/{Source Type}",
        "type": RULE_PROPERTY_XML_TYPE.VALUE,
    },
    "Source Port": "source/port",
    "Destination Type": {
        "path": "destination",
        "options": ["any", "address", "network"],
        "type": RULE_PROPERTY_XML_TYPE.CHILD,
    },
    "Not To Destination": {
        "path": "destination/not",
        "type": RULE_PROPERTY_XML_TYPE.BOOL,
    },
    "Destination": {
        "path": "destination/{Destination Type}",
        "type": RULE_PROPERTY_XML_TYPE.VALUE,
    },
    "Destination Port": "destination/port",
    "Log": {
        "path": "log",
        "type": RULE_PROPERTY_XML_TYPE.BOOL,
    },
    "Description": {
        "path": "descr",
        "type": RULE_PROPERTY_XML_TYPE.CDATA,
    },
    "Tracking ID": "tracker",
    "Associated Rule ID": "associated-rule-id",
    "ID": "id",
    "Tag": "tag",
    "Tagged": "tagged",
    "Max": "max",
    "Max Source Nodes": "max-src-nodes",
    "Max Source Connections": "max-src-conn",
    "Max Source States": "max-src-states",
    "State Timeout": "statetimeout",
    "State Type": {
        "path": "statetype",
        "type": RULE_PROPERTY_XML_TYPE.CDATA,
    },
    "OS": "os",
}

const _allFields_ = Object.keys(_rulePropertyXMLSchema_);

function _xmlElementGet_(ruleSchema, parentElement, index)
{
    if(typeof ruleSchema == "string")
    {
        ruleSchema = {
            "path": ruleSchema,
            "type": RULE_PROPERTY_XML_TYPE.VALUE,
        }
    }

    var value = ruleSchema.default;
    var element = parentElement;
    var elementPath = ruleSchema.path.split("/");

    for(var i = 0, numInElementPath = elementPath.length; i < numInElementPath; ++i)
    {
        if(lookupMatch = elementPath[i].match(/^{(.+?)}$/))
        {
            elementPath[i] = _xmlElementGet_(_rulePropertyXMLSchema_[lookupMatch[1]], parentElement);
        }

        element = element.getChild(elementPath[i]);
    }

    switch(ruleSchema.type)
    {
        case "bool":
            value = element ? true : false;
            break;
        case "order":
            value = index + 1;
            break;
        case "child":
            var childOptions = ruleSchema.options;
            for(var i = 0, numChildOptions = childOptions.length; i < numChildOptions; ++i)
            {
                if(element.getChild(childOptions[i]))
                {
                    value = childOptions[i];
                    break;
                }
            }
            break;
        default:
            if(element)
            {
                value = element.getValue();
            }
    }

    return value;
}

function _xmlElementSet_(ruleSchema, parentElement, value, valueLookup)
{
    // if(!value) return;

    if(typeof ruleSchema == "string")
    {
        ruleSchema = {
            "path": ruleSchema,
            "type": RULE_PROPERTY_XML_TYPE.VALUE,
        }
    }

    // for boolean types, stop if value is 0 or false
    if(ruleSchema.type == RULE_PROPERTY_XML_TYPE.BOOL && (!value || (value.match && value.match(/0|false/i)))) return;

    var element = parentElement;
    var elementPath = ruleSchema.path.split("/");

    for(var i = 0, numInElementPath = elementPath.length; i < numInElementPath; ++i)
    {
        if(!elementPath[i]) continue;

        if(lookupMatch = elementPath[i].match(/^{(.+?)}$/))
        {
            elementPath[i] = valueLookup(lookupMatch[1]);
        }

        if(element.getChild(elementPath[i]))
        {
            element = element.getChild(elementPath[i]);
        }
        else
        {
            var child = XmlService.createElement(elementPath[i]);
            element.addContent(child);
            element = child;
        }
    }

    switch(ruleSchema.type)
    {
        case "bool":
            // don't need to do anything for bool
            // if value is false then this function would have stopped earlier and the element would never have been created
            break;
        case "order":
            // no need to do anything for order
            break;
        case "child":
            if(!element.getChild(value))
            {
                var child = XmlService.createElement(value);
                element.addContent(child);
            }
            break;
        case "cdata":
            var child = XmlService.createCdata(value);
            element.addContent(child);
            break;
        default:
            element.setText(value);

    }
}