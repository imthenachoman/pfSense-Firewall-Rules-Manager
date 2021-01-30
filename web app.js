function doGet(e)
{
    // log some data
    // Logger.log("e: " + JSON.stringify(e));
    // Logger.log("Session.getActiveUser().getEmail(): " + Session.getActiveUser().getEmail());
    // Logger.log("Session.getEffectiveUser().getEmail(): " + Session.getEffectiveUser().getEmail());

    // load the HTML file
    return HtmlService.createHtmlOutputFromFile("index");
}

function importXML(formObject)
{
    var xml, xmlText, spreadsheet, rootFilterElement, fwRules;
    var dataRows = [_allFields_], numFields = _allFields_.length;

    // get the raw XML text
    if(formObject.fromSource == "xmlFile")
    {
        if(!formObject.xmlFile.getContentType().match(/^text\/((plain)|(xml))$/))
        {
            return {"success": false, "message": "invalid file type: " + formObject.xmlFile.getContentType()};
        }
        xmlText = formObject.xmlFile.getDataAsString();
    }
    else
    {
        xmlText = formObject.xmlText;
    }

    // check if the existing sheet exists
    if(formObject.destinationType == "googleSheet" && formObject.googleSheetType == "existing")
    {
        var sheetURL = formObject.existingSheetURL;
        var fileID = sheetURL.match(/[-\w]{25,}/);
        if(fileID)
        {
            try
            {
                spreadsheet = SpreadsheetApp.openById(fileID);
            }
            catch(e)
            {
                return {"success": false, "message": "unable to open '" + sheetURL + "'"};
            }
        }
        else
        {
            return {"success": false, "message": "invalid URL '" + sheetURL + "'"};
        }
    }

    // try reading the XML
    try
    {
        xml = XmlService.parse(xmlText);
    }
    catch(e)
    {
        return {"success": false, "message": "invalid XML"};
    }

    rootFilterElement = xml.getRootElement();
    if(rootFilterElement.getName() != "filter") rootFilterElement = rootFilterElement.getChild("filter");
    if(!rootFilterElement)
    {
        return {"success": false, "message": "no 'filter' element"};
    }

    fwRules = rootFilterElement.getChildren("rule");
    if(!fwRules.length)
    {
        return {"success": false, "message": "no rules"};
    }

    for(var i = 0, numRules = fwRules.length; i < numRules; ++i)
    {
        var fwRule = fwRules[i];
        var dataRow = [i + 1];
        dataRows.push(dataRow);

        for(var j = 0; j < numFields; ++j)
        {
            var fieldName = _allFields_[j];
            var fieldToPropertyXMLSchemaMapping = _rulePropertyXMLSchema_[fieldName];
            dataRow[j] = _xmlElementGet_(fieldToPropertyXMLSchemaMapping, fwRule, i);

            if(formObject.destinationType == "csv" && dataRow[j])
            {
                dataRow[j] = dataRow[j].toString().replace(/"/g, '""');
            }
        }
    }

    if(formObject.destinationType == "googleSheet")
    {
        if(formObject.googleSheetType == "new")
        {
            spreadsheet = SpreadsheetApp.create("pfSense FW RM - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH:mm:ss"));
        }
        
        var sheet = spreadsheet.insertSheet(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH:mm:ss"));

        sheet.deleteColumns(2, sheet.getMaxColumns() - 2);
        
        sheet.getRange(1, 1, dataRows.length, dataRows[0].length).setValues(dataRows);
        sheet.getRange(1, 1, dataRows.length, dataRows[0].length).applyRowBanding(SpreadsheetApp.BandingTheme.CYAN);
        sheet.getRange(1, 1, dataRows.length, dataRows[0].length).createFilter();

        sheet.setFrozenRows(1);

        for(var j = 0; j < numFields; ++j)
        {
            var fieldName = _allFields_[j];
            var fieldToPropertyXMLSchemaMapping = _rulePropertyXMLSchema_[fieldName];

            if(fieldToPropertyXMLSchemaMapping.options)
            {
                sheet.getRange(2, j + 1, sheet.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation()
                    .setAllowInvalid(false)
                    .setHelpText("Please select a valid option from the drop-down.")
                    .requireValueInList(fieldToPropertyXMLSchemaMapping.options, true)
                    .build()
                );
            }
            else if(fieldToPropertyXMLSchemaMapping.type == RULE_PROPERTY_XML_TYPE.BOOL)
            {
                sheet.getRange(2, j + 1, sheet.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation()
                    .setAllowInvalid(false)
                    .setHelpText("Please enter TRUE or FALSE.")
                    .requireCheckbox()
                    .build()
                );
            }
        }

        SpreadsheetApp.flush();

        return {"success": true, "data": spreadsheet.getUrl() + "#gid=" + sheet.getSheetId()};
    }
    else
    {
        for(var i = 0, numRows = dataRows.length; i < numRows; ++i)
        {
            dataRows[i] = '"' + dataRows[i].join('","') + '"'
        }

        return {"success": true, "data": dataRows.join("\n")};
    }
}

function getSheetNames(sheetURL)
{
    var spreadsheet;
    var fileID = sheetURL.match(/[-\w]{25,}/);
    if(fileID)
    {
        try
        {
            spreadsheet = SpreadsheetApp.openById(fileID);
        }
        catch(e)
        {
            return {"success": false, "message": "unable to open '" + sheetURL + "'"};
        }
    }
    else
    {
        return {"success": false, "message": "invalid URL '" + sheetURL + "'"};
    }

    var sheetNames = [];
    var allSheets = spreadsheet.getSheets();
    for(var i = 0, numSheets = allSheets.length; i < numSheets; ++i)
    {
        var sheet = allSheets[i];
        if(sheet.getRange(1, 1, 1, _allFields_.length).getDisplayValues()[0].join("|") == _allFields_.join("|"))
        {
            sheetNames.push(sheet.getName());
        }
    }

    if(sheetNames.length)
    {
        return {"success": true, "names": sheetNames};
    }
    else
    {
        return {"success": false, "message": "no valid sheets found"};
    }
}

function exportXML(formObject)
{
    var dataRows;

    switch(formObject.fromSource)
    {
        case "googleSheet":
            var fileID = formObject.sheetURL.match(/[-\w]{25,}/);
            dataRows = SpreadsheetApp.openById(fileID).getSheetByName(formObject.sheetName).getDataRange().getValues();
            break;
        case "csvFile":
            dataRows = Utilities.parseCsv(formObject.csvFile.getDataAsString());
            break;
        case "csvInput":
            dataRows = Utilities.parseCsv(formObject.csvText);
            break;
    }

    if(dataRows[0].join("|") != _allFields_.join("|"))
    {
        return {"success": false, "message": "malformed/invalid data"};
    }

    var headerRow = dataRows.shift();
    var numFields = headerRow.length;
    var orderColumn = headerRow.indexOf("Order");

    dataRows.sort((a, b) =>
    {
        if(a[orderColumn] == b[orderColumn]) return 0;
        else return a[orderColumn] < b[orderColumn] ? -1 : 1;
    });

    var xmlRoot = XmlService.createElement("filter");

    for(var i = 0, numRows = dataRows.length; i < numRows; ++i)
    {
        var dataRow = dataRows[i];
        
        // skip rows where interface is not set
        if(!dataRow[orderColumn]) continue;

        var xmlRule = XmlService.createElement("rule");
        xmlRoot.addContent(xmlRule);

        for(var j = 0; j < numFields; ++j)
        {
            var fieldName = headerRow[j];
            var fieldToPropertyXMLSchemaMapping = _rulePropertyXMLSchema_[fieldName];

            _xmlElementSet_(fieldToPropertyXMLSchemaMapping, xmlRule, dataRow[j], lookupQuery =>
            {
                return dataRow[headerRow.indexOf(lookupQuery)];
            });
        }
    }
    
    return {"success": true, "xml": XmlService.getPrettyFormat().format(XmlService.createDocument(xmlRoot))};
}