import * as d3 from "d3";
let data = [10,20,40,20,40];
const svg_element = d3.select("svg");

svg_element.selectAll("rect").data(data)
.attr("x",(d,i)=>i*60)
.attr("height", d=>d*2)
.attr("width",(d)=>10)
.attr("fill",()=>"pink")
