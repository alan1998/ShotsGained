import { GpsLogPoint } from '../app/util/calcs';
export class TxtFilePos {
// Open files
// Get list of locations
    fileName: string;

    Open(f):Promise<Array<GpsLogPoint>> {
        const fs = new FileReader();
        const pts = new Array<GpsLogPoint>();
        
        return new Promise((resolve, reject) => {
            fs.onerror = () => {
                fs.abort();
                reject(new DOMException("Problem with input file reading"));
            };

            fs.onload = () => {
                const data: string  =  fs.result;
                const lines = data.split('\n');
                lines.forEach( e => {
                    const tk = e.split(',');
                    if (tk.length === 5) {
                        const p = new GpsLogPoint( parseFloat( tk[2]), parseFloat(tk[3]), tk[0], tk[1]);
                        pts.push(p);
                    }
                });
                resolve(pts);
            };
            fs.readAsText(f);
        });   
    }
}
