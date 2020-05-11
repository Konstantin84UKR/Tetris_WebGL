attribute vec3 a_position;
//attribute vec3 a_color;
attribute vec3 a_normal;

uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;
uniform mat4 u_Pmatrix;
uniform vec3 u_color;

varying vec3 v_color;
varying vec3 v_normal;
varying vec3 v_position;

 void main() 
{
gl_PointSize = 10.0;
v_color = u_color;
v_normal = a_normal;
v_position = vec4(u_Mmatrix * vec4(a_position, 1.0)).xyz;
gl_Position = u_Pmatrix * u_Vmatrix * u_Mmatrix * vec4(a_position, 1.0);
}