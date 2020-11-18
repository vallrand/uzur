const simpleNoise = `
float random(float seed){ return fract(sin(seed) * 71523.5413291); }
float random(vec2 seed){ return random(dot(seed, vec2(13.4251, 15.5128))); }

float noise(vec2 coordinate){
    vec2 quotient = floor(coordinate);
    vec2 fraction = coordinate - quotient;
    fraction *= fraction * (3.0 - 2.0 * fraction);
    return mix(
        mix(random(quotient), random(quotient + vec2(1, 0)), fraction.x),
        mix(random(quotient + vec2(0, 1)), random(quotient + vec2(1, 1)), fraction.x),
        fraction.y
    );
}`
export const sky = `
varying vec2 uvPass;
uniform float time;

uniform vec3 backColor;
uniform vec3 frontColor;

${simpleNoise}

float fbm(vec2 x){
    float r = 0.0, s = 1.0, w = 1.0;
    for (int i=0; i<5; i++){
        s *= 2.0;
        w *= 0.5;
        r += w * noise(s * x);
    }
    return r;
}

float cloud(vec2 uv, float scalex, float scaley, float density, float sharpness, float speed){
    return pow(clamp(fbm(vec2(scalex,scaley)*(uv+vec2(speed,0)*time))-(1.0-density),0.,1.), 1.0-sharpness);
}


vec3 render(vec2 uv){
    vec3 color = mix(frontColor, backColor, uv.y);

    vec3 cloudsColor = mix(backColor * 0.5, vec3(1.0, 1.0, 1.0), uv.y);
    float cloudDistance = mix(0.9, 0.1, pow(uv.y, 0.7));
    color = mix(color, cloudsColor, cloud(uv, 2., 8., cloudDistance, 0.4, 0.04));
    
    color = mix(color, mix(backColor, color, 0.64), 8.*cloud(uv,14.,18.,0.9,0.75,0.02) * cloud(uv,2.,5.,0.6,0.15,0.01)*(uv.y + 0.5));
    color = mix(color, mix(0.85 * frontColor, 1.15 * backColor, uv.y * 1.5 - 0.5), 5.*cloud(uv,12.,15.,0.9,0.75,0.03) * cloud(uv,2.,8.,0.5,0.0,0.02)*(uv.y + 1.0));

    vec2 sunPosition = uv - vec2(0., 0.4);
    float sun = exp(-20.*dot(sunPosition, sunPosition));
    vec3 sunColor = mix(pow(frontColor, vec3(4.0)), vec3(1.0), 0.5) * sun * 0.7;
    color += sunColor;

    color = pow(color,vec3(1.3));
    return color;
}

void main(){
    vec2 uv = uvPass;
    uv.x -= 0.5;
    gl_FragColor = vec4(render(uv),1.0);
}`
