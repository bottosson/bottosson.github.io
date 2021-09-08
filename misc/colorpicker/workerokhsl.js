importScripts('colorconversion.js', 'constants.js', 'hsluv.js','render.js');

let pendingRender = false;
let r = 0;
let g = 0;
let b = 0;

onmessage = function(e) 
{
    r = e.data[0];
    g = e.data[1];
    b = e.data[2];

    if (!pendingRender)
    {
        pendingRender = true;
        setTimeout(function()
        {
            pendingRender = false;
            postMessage(render_okhsl(r,g,b));
        }, 30);
    }
}