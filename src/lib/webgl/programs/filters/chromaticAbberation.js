export const chromaticAbberationFilter = {
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec2 invResolution;

uniform float offset;
uniform float rotation;

void main(){
    vec2 direction = vec2(cos(rotation), sin(rotation));

    vec4 red = texture2D(sampler, uvPass + invResolution * direction * offset);
    vec4 green = texture2D(sampler, uvPass + invResolution);
    vec4 blue = texture2D(sampler, uvPass + invResolution * direction * -offset);

    gl_FragColor = vec4(red.r, green.g, blue.b, (red.a + green.a + blue.a) / 3.0);    
}`
}