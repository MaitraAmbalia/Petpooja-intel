const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx') || dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
                callback(dirPath);
            }
        }
    });
}

const targetDir = path.join(__dirname, '../app');

walkDir(targetDir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace item.foodName -> item.name
    content = content.replace(/\.foodName/g, '.name');
    content = content.replace(/foodName:/g, 'name:');
    content = content.replace(/foodName /g, 'name ');

    // Replace item.foodCost -> item.cost
    content = content.replace(/\.foodCost/g, '.cost');
    content = content.replace(/foodCost:/g, 'cost:');
    content = content.replace(/foodCost /g, 'cost ');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched ${filePath}`);
    }
});

console.log("Patch complete.");
