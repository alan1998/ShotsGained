export class TxtFilePos {
// Open files
// Get list of locations
    fileName: string;

    Open(f): void {
        const fs = new FileReader();

        fs.onload = (e => {
            console.log(fs.result);
        });
        fs.readAsText(f, 'UTF8');
    }
}
