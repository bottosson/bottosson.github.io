const GA_ID = document.documentElement.getAttribute("ga-id");
        window.ga =
        window.ga ||
        function () {
            if (!GA_ID) {
            return;
            }
            (ga.q = ga.q || []).push(arguments);
        };
        ga.l = + new Date();

        ga("create", GA_ID, 
        {
        'storage': 'none',
        'storeGac': false,
        'anonymizeIp': true,
        'allowAdFeatures': false,
        });
        ga("set", "transport", "beacon");
        var timeout = setTimeout(
        (onload = function () {
            clearTimeout(timeout);
            ga("send", "pageview");
        }),
        1000
        );
        
        let r = 255;
        let g = 0;
        let b = 0;

        m = location.hash.match(/^#([0-9a-f]{6})$/i);
        if (m) 
        {
            r = eps + (1-2*eps)*parseInt(m[1].substr(0,2),16);
            g = eps + (1-2*eps)*parseInt(m[1].substr(2,2),16);
            b = eps + (1-2*eps)*parseInt(m[1].substr(4,2),16);
        }

        let worker = new Worker('worker.js');    
        worker.onmessage = function(e) 
        {
            display_results(e.data);
        };

        let worker_hsluv = new Worker('workerhsluv.js');    
        worker_hsluv.onmessage = function(e) 
        {
            display_results_hsluv(e.data);
        };

        let worker_okhsl = new Worker('workerokhsl.js');    
        worker_okhsl.onmessage = function(e) 
        {
            display_results_okhsl(e.data);
        };
        
        function update_canvas(id, image)
        {
            let canvas = document.getElementById(id);
            let ctx = canvas.getContext('2d');
            ctx.putImageData(image, 0, 0);
        }

        function display_results(results)
        {
            update_canvas('hsv_sv_canvas', results["hsv_sv"]);
            update_canvas('okhsv_sv_canvas', results["okhsv_sv"]);
            update_canvas('oklch_lc_canvas', results["oklch_lc"]);

            update_canvas('hsl_hs_canvas', results["hsl_hs"]);
            update_canvas('hsl_hl_canvas', results["hsl_hl"]);
            update_canvas('hsl_s_canvas', results["hsl_s"]);
            update_canvas('hsl_sl_canvas', results["hsl_sl"]);
        }

        function display_results_hsluv(results)
        {
            update_canvas('hsluv_hs_canvas', results["hsluv_hs"]);
            update_canvas('hsluv_hl_canvas', results["hsluv_hl"]);
            update_canvas('hsluv_s_canvas', results["hsluv_s"]);
            update_canvas('hsluv_sl_canvas', results["hsluv_sl"]);
        }

        function display_results_okhsl(results)
        {
            update_canvas('okhsl_hs_canvas', results["okhsl_hs"]);
            update_canvas('okhsl_hl_canvas', results["okhsl_hl"]);
            update_canvas('okhsl_s_canvas', results["okhsl_s"]);
            update_canvas('okhsl_sl_canvas', results["okhsl_sl"]);
        }

        function update(async=true) 
        {
            function update_hsl_manipulators(prefix, to_hsl)
            {
                let hsl = to_hsl(r,g,b);
                let hsl_a = 0.5 + 0.5*hsl[1]*Math.cos(hsl[0]*2*Math.PI);
                let hsl_b = 0.5 + 0.5*hsl[1]*Math.sin(hsl[0]*2*Math.PI);
                document.getElementById(prefix + '_hs_manipulator').transform.baseVal.getItem(0).setTranslate(picker_size*hsl_a,picker_size*(1-hsl_b));
                document.getElementById(prefix + '_l_manipulator').transform.baseVal.getItem(0).setTranslate(0,picker_size*(1-hsl[2]));
                
                document.getElementById(prefix + '_hl_manipulator').transform.baseVal.getItem(0).setTranslate(picker_size*hsl[0],picker_size*(1-hsl[2]));
                document.getElementById(prefix + '_s_manipulator').transform.baseVal.getItem(0).setTranslate(0,picker_size*(1-hsl[1]));

                document.getElementById(prefix + '_sl_manipulator').transform.baseVal.getItem(0).setTranslate(picker_size*hsl[1],picker_size*(1-hsl[2]));
                document.getElementById(prefix + '_h_manipulator').transform.baseVal.getItem(0).setTranslate(0,picker_size*hsl[0]);

                document.getElementById(prefix + '_h_input').value = Math.round(360*hsl[0]);
                document.getElementById(prefix + '_s_input').value = Math.round(100*hsl[1]);
                document.getElementById(prefix + '_l_input').value = Math.round(100*hsl[2]);
            }

            let hsv = rgb_to_hsv(r,g,b);
            document.getElementById('hsv_sv_manipulator').transform.baseVal.getItem(0).setTranslate(picker_size*hsv[1],picker_size*(1-hsv[2]));
            document.getElementById('hsv_h_manipulator').transform.baseVal.getItem(0).setTranslate(0,picker_size*hsv[0]);
            document.getElementById('hsv_h_input').value = Math.round(360*hsv[0]);
            document.getElementById('hsv_s_input').value = Math.round(100*hsv[1]);
            document.getElementById('hsv_v_input').value = Math.round(100*hsv[2]);

            let okhsv = srgb_to_okhsv(r,g,b);
            document.getElementById('okhsv_sv_manipulator').transform.baseVal.getItem(0).setTranslate(picker_size*okhsv[1],picker_size*(1-okhsv[2]));
            document.getElementById('okhsv_h_manipulator').transform.baseVal.getItem(0).setTranslate(0,picker_size*okhsv[0]);
            document.getElementById('okhsv_h_input').value = Math.round(360*okhsv[0]);
            document.getElementById('okhsv_s_input').value = Math.round(100*okhsv[1]);
            document.getElementById('okhsv_v_input').value = Math.round(100*okhsv[2]);

            {
                let lab = linear_srgb_to_oklab(
                    srgb_transfer_function_inv(r/255),
                    srgb_transfer_function_inv(g/255),
                    srgb_transfer_function_inv(b/255)
                );
                let L = toe(lab[0]);
                let h = 0.5 + 0.5*Math.atan2(-lab[2], -lab[1])/Math.PI;
                let C = Math.sqrt(lab[1]*lab[1] +lab[2]*lab[2]);

                document.getElementById('oklch_lc_manipulator').transform.baseVal.getItem(0).setTranslate(picker_size*C/oklab_C_scale,picker_size*(1-L));
                document.getElementById('oklch_h_manipulator').transform.baseVal.getItem(0).setTranslate(0,picker_size*h);

                document.getElementById('oklch_h_input').value = Math.round(360*h);
                document.getElementById('oklch_c_input').value = Math.round(100*C);
                document.getElementById('oklch_l_input').value = Math.round(100*L);
            }

            update_hsl_manipulators("hsl", rgb_to_hsl);
            update_hsl_manipulators("okhsl", srgb_to_okhsl);
            update_hsl_manipulators("hsluv", rgb_to_hsluv);

            if (async)
            {
                worker.postMessage([r,g,b]);
                worker_hsluv.postMessage([r,g,b]);
                worker_okhsl.postMessage([r,g,b]);
            }
            else
            {
                display_results(render(r,g,b));
                display_results_hsluv(render_hsluv(r,g,b));
                display_results_okhsl(render_okhsl(r,g,b));
            }

            document.getElementById('swatch').style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
            document.getElementById('hex_input').value = rgb_to_hex(r,g,b);
        }

        function initialize()
        {   
            let mouse_handler = null;
            let touch_handler = null;

            function update_url()
            {
                history.replaceState(null, null, rgb_to_hex(r,g,b));
            }

            function setup_input_handler(input, handler)
            {
                input.addEventListener('change', (event) => {
                    let newValue = Number(event.target.value);
                    if (Number.isNaN(newValue))
                        return;
                    handler(newValue);
                    update();
                    update_url();  
                }, false);
            }

            function setup_handler(canvas, handler)
            {
                let outer_mouse_handler = function(event) 
                {
                    event.preventDefault();

                    let rect = canvas.getBoundingClientRect();      
                    let x = event.clientX - rect.left;
                    let y = event.clientY - rect.top;

                    handler(x,y);

                    update();
                };

                let outer_touch_handler = function(event) 
                {
                    event.preventDefault();

                    touch = event.touches[0];

                    let rect = canvas.getBoundingClientRect();
                    let x = touch.clientX - rect.left;
                    let y = touch.clientY - rect.top;

                    handler(x,y);

                    update();
                };

                canvas.addEventListener('mousedown', function(event)
                {
                    mouse_handler = outer_mouse_handler;
                    outer_mouse_handler(event);

                }, false);

                canvas.addEventListener('touchstart', function(event)
                {
                    if (event.touches.length === 1)
                    {
                        touch_handler = outer_touch_handler;
                        outer_touch_handler(event);
                    }
                    else
                    {
                        touch_handler = null;
                    }

                }, false);
            }

            function clamp(x)
            {
                return x < eps ? eps : (x > 1-eps ? 1-eps : x);
            }

            document.addEventListener('mouseup', function(event)
            {
                if (mouse_handler !== null)
                {
                    mouse_handler(event);
                    mouse_handler = null;
                    update_url();    
                }

            }, false);
            document.addEventListener('mousemove', function(event)
            {
                if (mouse_handler !== null)
                {
                    mouse_handler(event);      
                }
            }, false);

            document.addEventListener('touchend', function(event)
            {
                if (touch_handler !== null && event.touches.length === 0)
                {
                    touch_handler = null;     
                    update_url();    
                }

            }, false);
            document.addEventListener('touchmove', function(event)
            {
                if (touch_handler !== null && event.touches.length === 1)
                {
                    touch_handler(event);  
                }
            }, false);

            function setup_hsl_handlers(prefix, to_hsl, from_hsl)
            {
                setup_handler(document.getElementById(prefix + '_hs_canvas'), function(x, y) 
                {
                    let hsl = to_hsl(r,g,b);

                    let hsl_a = 2*(y/picker_size)-1;
                    let hsl_b = 2*(1 - x/picker_size)-1;

                    let new_h = 0.5+0.5*Math.atan2(hsl_a, hsl_b)/Math.PI;
                    let new_s = clamp(Math.sqrt(hsl_a**2 + hsl_b**2));

                    rgb = from_hsl(new_h, new_s, hsl[2]);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });

                setup_handler(document.getElementById(prefix + '_l_canvas'), function(x, y) 
                {
                    let l = clamp(1 - y/picker_size);

                    let hsl = to_hsl(r,g,b);
                    rgb = from_hsl(hsl[0], hsl[1], l);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });

                setup_handler(document.getElementById(prefix + '_hl_canvas'), function(x, y) 
                {
                    let hsl = to_hsl(r,g,b);

                    let new_h = clamp(x/picker_size);
                    let new_l = clamp(1 - y/picker_size);

                    rgb = from_hsl(new_h, hsl[1], new_l);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });

                setup_handler(document.getElementById(prefix + '_s_canvas'), function(x, y) 
                {
                    let s = clamp(1 - y/picker_size);

                    let hsl = to_hsl(r,g,b);
                    rgb = from_hsl(hsl[0], s, hsl[2]);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });

                setup_handler(document.getElementById(prefix + '_sl_canvas'), function(x, y) 
                {
                    let hsl = to_hsl(r,g,b);

                    let new_s = clamp(x/picker_size);
                    let new_v = clamp(1 - y/picker_size);

                    rgb = from_hsl(hsl[0], new_s, new_v);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });

                setup_handler(document.getElementById(prefix + '_h_canvas'), function(x, y) 
                {
                    let h = clamp(y/picker_size);

                    let hsl = to_hsl(r,g,b);
                    rgb = from_hsl(h, hsl[1], hsl[2]);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });

                setup_input_handler(document.getElementById(prefix + '_h_input'), function(h)
                {
                    h = clamp(h/360);
                    let hsl = to_hsl(r,g,b);
                    rgb = from_hsl(h, hsl[1], hsl[2]);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });
                setup_input_handler(document.getElementById(prefix + '_s_input'), function(s)
                {
                    s = clamp(s/100);
                    let hsl = to_hsl(r,g,b);
                    rgb = from_hsl(hsl[0], s, hsl[2]);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });
                setup_input_handler(document.getElementById(prefix + '_l_input'), function(l)
                {
                    l = clamp(l/100);
                    let hsl = to_hsl(r,g,b);
                    rgb = from_hsl(hsl[0], hsl[1], l);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                });
            }

            setup_handler(document.getElementById('hsv_sv_canvas'), function(x, y) 
            {
                let hsv = rgb_to_hsv(r,g,b);

                let new_s = clamp(x/picker_size);
                let new_v = clamp(1 - y/picker_size);

                rgb = hsv_to_rgb(hsv[0], new_s, new_v);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });

            setup_handler(document.getElementById('hsv_h_canvas'), function(x, y) 
            {
                let h = clamp(y/picker_size);

                let hsv = rgb_to_hsv(r,g,b);
                rgb = hsv_to_rgb(h, hsv[1], hsv[2]);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });
            setup_input_handler(document.getElementById('hsv_h_input'), function(h)
            {
                h = clamp(h/360);
                let hsl = rgb_to_hsv(r,g,b);
                rgb = hsv_to_rgb(h, hsl[1], hsl[2]);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });
            setup_input_handler(document.getElementById('hsv_s_input'), function(s)
            {
                s = clamp(s/100);
                let hsl = rgb_to_hsv(r,g,b);
                rgb = hsv_to_rgb(hsl[0], s, hsl[2]);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });
            setup_input_handler(document.getElementById('hsv_v_input'), function(v)
            {
                v = clamp(v/100);
                let hsl = rgb_to_hsv(r,g,b);
                rgb = hsv_to_rgb(hsl[0], hsl[1], v);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });

            setup_handler(document.getElementById('okhsv_sv_canvas'), function(x, y) 
            {
                let hsv = srgb_to_okhsv(r,g,b);

                let new_s = clamp(x/picker_size);
                let new_v = clamp(1 - y/picker_size);

                rgb = okhsv_to_srgb(hsv[0], new_s, new_v);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });
            setup_handler(document.getElementById('okhsv_h_canvas'), function(x, y) 
            {
                let h = clamp(y/picker_size);

                let hsv = srgb_to_okhsv(r,g,b);
                rgb = okhsv_to_srgb(h, hsv[1], hsv[2]);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });
            setup_input_handler(document.getElementById('okhsv_h_input'), function(h)
            {
                h = clamp(h/360);
                let hsl = srgb_to_okhsv(r,g,b);
                rgb = okhsv_to_srgb(h, hsl[1], hsl[2]);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });
            setup_input_handler(document.getElementById('okhsv_s_input'), function(s)
            {
                s = clamp(s/100);
                let hsl = srgb_to_okhsv(r,g,b);
                rgb = okhsv_to_srgb(hsl[0], s, hsl[2]);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });
            setup_input_handler(document.getElementById('okhsv_v_input'), function(v)
            {
                v = clamp(v/100);
                let hsl = srgb_to_okhsv(r,g,b);
                rgb = okhsv_to_srgb(hsl[0], hsl[1], v);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            });

            
            setup_handler(document.getElementById('oklch_lc_canvas'), function(x, y) 
            {
                let lab = linear_srgb_to_oklab(
                    srgb_transfer_function_inv(r/255),
                    srgb_transfer_function_inv(g/255),
                    srgb_transfer_function_inv(b/255)
                );

                l = Math.sqrt(lab[1]*lab[1] +lab[2]*lab[2]);
                let a_ = lab[1]/l;
                let b_ = lab[2]/l;

                let new_C = Math.max(x/picker_size, eps);
                let new_L = y < picker_size ? toe_inv((1 - y/picker_size)) : (1 - y/picker_size);

                let LC = find_cusp(a_, b_)
                
                let L0;
                if (new_L > LC[0])
                {   
                    let L_d = (LC[0] - 1);
                    let C_d = LC[1]/oklab_C_scale;
                    let l2 = L_d*L_d +C_d*C_d;

                    d = ((new_L-1) * L_d + new_C * C_d)/l2;
                    d = clamp(d);

                    let k = new_C/(new_C - C_d*d)
                    L0 = (1-k) * new_L + k*(1 + L_d*d)
                }
                else
                {
                    let L_d = LC[0];
                    let C_d = LC[1]/oklab_C_scale;
                    let l2 = L_d*L_d +C_d*C_d;

                    d = (new_L * L_d + new_C * C_d)/l2;
                    d = clamp(d);

                    let k = new_C/(new_C - C_d*d)
                    L0 = (1-k) * new_L + k*(L_d*d)
                }

                new_C = oklab_C_scale*new_C;
                
                // closest point on triangle would be better...
                // but need to convert that to achromatic point still..
                let t = find_gamut_intersection(a_,b_,new_L,new_C,L0);

                t = clamp(t);

                new_C = t*new_C;
                new_L = t*new_L + (1-t)*L0;
                
                if (new_L < eps) // avoid strange behavior around L = 0
                    new_C = eps*new_L;
                
                let rgb = oklab_to_linear_srgb(new_L, new_C*a_, new_C*b_);

                r = 255*srgb_transfer_function(rgb[0]);
                g = 255*srgb_transfer_function(rgb[1]);
                b = 255*srgb_transfer_function(rgb[2]);
            });

            setup_handler(document.getElementById('oklch_h_canvas'), function(x, y) 
            {
                let lab = linear_srgb_to_oklab(
                    srgb_transfer_function_inv(r/255),
                    srgb_transfer_function_inv(g/255),
                    srgb_transfer_function_inv(b/255)
                );

                let L = lab[0];
                let C = Math.sqrt(lab[1]*lab[1] +lab[2]*lab[2]);

                let h = clamp(y/picker_size)
                let a_ = Math.cos(2*Math.PI*h);
                let b_ = Math.sin(2*Math.PI*h);

                let t = find_gamut_intersection(a_,b_,L,C,L);
                t = Math.min(t,1);
                C = clamp(t*C);       

                let rgb = oklab_to_linear_srgb(L, C*a_, C*b_);

                r = 255*srgb_transfer_function(rgb[0]);
                g = 255*srgb_transfer_function(rgb[1]);
                b = 255*srgb_transfer_function(rgb[2]);
            });

            setup_input_handler(document.getElementById('oklch_h_input'), function(h)
            {
                let lab = linear_srgb_to_oklab(
                    srgb_transfer_function_inv(r/255),
                    srgb_transfer_function_inv(g/255),
                    srgb_transfer_function_inv(b/255)
                );
                let L = lab[0];
                h = clamp(h/360);
                let C = Math.sqrt(lab[1]*lab[1] +lab[2]*lab[2]);
                let a_ = Math.cos(2*Math.PI*h);
                let b_ = Math.sin(2*Math.PI*h);

                let t = find_gamut_intersection(a_,b_,L,C,L);
                t = Math.min(t,1);
                C = clamp(t*C);       

                let rgb = oklab_to_linear_srgb(L, C*a_, C*b_);

                r = 255*srgb_transfer_function(rgb[0]);
                g = 255*srgb_transfer_function(rgb[1]);
                b = 255*srgb_transfer_function(rgb[2]);
            });
            setup_input_handler(document.getElementById('oklch_c_input'), function(C)
            {
                let lab = linear_srgb_to_oklab(
                    srgb_transfer_function_inv(r/255),
                    srgb_transfer_function_inv(g/255),
                    srgb_transfer_function_inv(b/255)
                );
                let L = lab[0];
                let h = 0.5 + 0.5*Math.atan2(-lab[2], -lab[1])/Math.PI;
                C = clamp(C/100);
                let a_ = Math.cos(2*Math.PI*h);
                let b_ = Math.sin(2*Math.PI*h);

                let t = find_gamut_intersection(a_,b_,L,C,L);
                t = Math.min(t,1);
                C = clamp(t*C);       

                let rgb = oklab_to_linear_srgb(L, C*a_, C*b_);

                r = 255*srgb_transfer_function(rgb[0]);
                g = 255*srgb_transfer_function(rgb[1]);
                b = 255*srgb_transfer_function(rgb[2]);
            });
            setup_input_handler(document.getElementById('oklch_l_input'), function(L)
            {
                let lab = linear_srgb_to_oklab(
                    srgb_transfer_function_inv(r/255),
                    srgb_transfer_function_inv(g/255),
                    srgb_transfer_function_inv(b/255)
                );
                let h = 0.5 + 0.5*Math.atan2(-lab[2], -lab[1])/Math.PI;
                let C = Math.sqrt(lab[1]*lab[1] +lab[2]*lab[2]);
                L = toe_inv(clamp(L/100));
                let a_ = Math.cos(2*Math.PI*h);
                let b_ = Math.sin(2*Math.PI*h);

                let t = find_gamut_intersection(a_,b_,L,C,L);
                t = Math.min(t,1);
                C = clamp(t*C);       

                let rgb = oklab_to_linear_srgb(L, C*a_, C*b_);

                r = 255*srgb_transfer_function(rgb[0]);
                g = 255*srgb_transfer_function(rgb[1]);
                b = 255*srgb_transfer_function(rgb[2]);
            });

            setup_hsl_handlers("hsl", rgb_to_hsl, hsl_to_rgb);
            setup_hsl_handlers("okhsl", srgb_to_okhsl, okhsl_to_srgb);
            setup_hsl_handlers("hsluv", rgb_to_hsluv, hsluv_to_rgb);

            document.getElementById('hex_input').addEventListener('change', (event) => {
                let rgb = hex_to_rgb(event.target.value);
                if (rgb == null)
                    return; 
                
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];

                update();
                update_url();  
            }, false);

            let results = render_static();
                                       
            update_canvas('hsv_h_canvas', results["hsv_h"]);
            update_canvas('okhsv_h_canvas', results["okhsv_h"]);
            update_canvas('oklch_h_canvas', results["oklch_h"]);

            update_canvas('hsl_l_canvas', results["hsl_l"]);
            update_canvas('hsl_h_canvas', results["hsl_h"]);

            update_canvas('hsluv_l_canvas', results["hsluv_l"]);
            update_canvas('hsluv_h_canvas', results["hsluv_h"]);

            update_canvas('okhsl_l_canvas', results["okhsl_l"]);
            update_canvas('okhsl_h_canvas', results["okhsl_h"]);


            update(false);
        }