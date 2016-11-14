// dependencies
const fs = require("fs");
const json2csv = require("json2csv");
const readline = require("readline");
const path = require("path");

// args
const argv = require("argv");
const extentions = argv.run().targets[0];
var _dir = argv.run().targets[1];
var prefix = argv.run().targets[2];
var mode = argv.run().targets[3];
if (!_dir) {
    console.error("No directory! error!");
    return;
}
if (!prefix) {
    console.error("no prefix! error!");
    return;
}

// directory
const directory = _dir.match(/^\//) ? _dir : path.join(__dirname, _dir);

// count for file name
var count = 1;

// csv
const csvFilePath = directory + "/" + new Date().getTime() + ".csv";
var destData = [];

// readline
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// do it !!
fs.readdir(directory, function(err, files) {
    if (err) throw err;
    // get target Files
    var fileList = [];
    files.filter(function(file) {
        var filePath = directory + "/" + file;
        var reg = new RegExp(".*\." + extentions + "$");
        return fs.statSync(filePath).isFile() && reg.test(file);
    }).forEach(function(file) {
        fileList.push(file);
    });

    // return if no files
    if (fileList.length == 0) {
        console.log("no files");
        rl.close();
        return;
    }

    // rename
    rl.question("Enter 'yes' if rename " + fileList.length + " files : ", function(answer) {
        if (answer == "yes") {
            for (var i in fileList) {
                var f = fileList[i];
                var ext = f.match(/\..*$/);
                var n = prefix + "_" + zeroFill(count++, 5) + ext;
                destData.push({
                    old: f,
                    new: n
                });
                if (mode == "notest") {
                    // rename
                    fs.renameSync(directory + "/" + f, directory + "/" + n);
                }
            }
            jsonToCsv(destData, csvFilePath);
        }
        rl.close();
    });
});

/**
 * jsonをCSVファイルに。
 */
function jsonToCsv(jsonData, csvtmpFileName) {
    var csv = json2csv({ data: jsonData });
    fs.writeFile(csvtmpFileName, csv, function(e) {});
}
/**
 * zero fill
 */
function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}
