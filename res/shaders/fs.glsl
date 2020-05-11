precision mediump float;

varying vec3 v_color;
varying vec3 v_normal;
varying vec3 v_position;

vec2 blinnPhongDir(vec3 lightDir, float lightInt, float Ka, float Kd, float Ks, float shininess)
{
  vec3 s = normalize(lightDir);
  vec3 v = normalize(-v_position);
  vec3 n = normalize(v_normal);
  vec3 h = normalize(v+s);
  float diffuse = Ka + Kd * lightInt * max(0.0, dot(n, s));
  float spec =  Ks * pow(max(0.0, dot(n,h)), shininess);
  return vec2(diffuse, spec);
}


void main() 
{
vec3 lightPositions = vec3(0.0,10.0,10.0);
vec3 L = normalize(lightPositions - v_position);
vec2 blinn = blinnPhongDir(L, 1.0, 0.3, 0.7, 0.5, 20.0);

vec3 color_D =vec3(blinn.x);
vec3 color_S =vec3(blinn.y);  
vec3 color = color_D +color_S;

gl_FragColor = vec4(color * v_color, 1.0);
}