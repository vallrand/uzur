const tileableNoise = `
float hash21(vec2 uv, float tile, float offset) {
    uv = mod(uv, tile);
    uv += offset / tile;
	return fract(7856.54 * sin(dot(uv, vec2(5.56, 78.7))));
}

float noise(vec2 uv, float tile, float offset) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    f = f * f * (3. - 2. * f);
    vec2 o = vec2(1., 0.);
	return  mix(
        mix(hash21(i + o.yy, tile, offset), hash21(i + o.xy, tile, offset), f.x),
        mix(hash21(i + o.yx, tile, offset), hash21(i + o.xx, tile, offset), f.x), f.y);
}`

export const terrain = `
varying vec2 uvPass;
uniform float time;

${tileableNoise}

const int OCTAVES = 4;
const float tileScale = 4.0;
float fbm(vec2 uv){
    uv *= tileScale;

    float value = 0.0,
    scale = 1.0,
    weight = 0.0;
    for(int i = 0; i <= OCTAVES; i++){
        value += noise(uv, tileScale / scale, time) * scale;
        uv *= 2.0;
        weight += scale;
        scale *= 0.5;
    }
    return value / weight;
}

uniform vec3 backgroundColor;
uniform vec3 foregroundColor;
uniform vec3 middlegroundColor;

void main(){
	vec2 uv = uvPass;

  	float n = max(fbm(uv), 0.0);
    n = n * n * (3.0 - 2.0 * n);

    vec3 color = vec3(0.0);
    color = foregroundColor + backgroundColor;
    if(n < .95) color = 2.0 * backgroundColor * foregroundColor;
    if(n < .9) color = 2.0 * mix(backgroundColor, foregroundColor, 0.64);
    if(n < .85) color = mix(foregroundColor, vec3(1.0), 0.5);
    if(n < .8) color = mix(foregroundColor, vec3(1.0), 0.25);
    if(n < .7) color = 2.0 * foregroundColor * foregroundColor;
    if(n < .6) color = foregroundColor;
    if(n < .5) color = 0.5 * foregroundColor;
    if(n < .4) color = mix(middlegroundColor, foregroundColor, 0.5);
    if(n < .35) color = middlegroundColor;
    if(n < .3) color = mix(backgroundColor, middlegroundColor, 0.5);
    if(n < .25) color = mix(backgroundColor, vec3(1.0), 0.25);
    if(n < .2) color = backgroundColor;
    if(n < .1) color = 0.5 * backgroundColor;
    if(n < .05) color = 0.25 * backgroundColor;

	gl_FragColor = vec4(color, 1.0);
}`