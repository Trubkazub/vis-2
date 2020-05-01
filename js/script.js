const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

// Part 1: Создать шкалы для цвета, радиуса и позиции +
const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
    .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip');

//  Part 1 - Создать симуляцию с использованием forceCenter(), forceX() и forceCollide() +-
const simulation = d3.forceSimulation()
        //.nodes(nodes)
        .force("center", d3.forceCenter(b_width / 2, b_height / 2))
        .force("force_x", d3.forceX(d => x(d['release year'])))
        .force("collide", d3.forceCollide().radius(d => radius(d['user rating score'])));


d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data)
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    
    // Part 1 - задать domain  для шкал цвета, радиуса и положения по x
    color.domain(ratings);
    radius.domain([d3.min(rating), d3.max(rating)]);
    x.domain([d3.min(years), d3.max(years)]);

    // Part 1 - создать circles на основе data
    var nodes = bubble
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('r', d => radius(+d['user rating score']))
        .style('fill', d => color(d.rating))
        .style("opacity", 1) //для лучшей разницы;

    // добавляем обработчики событий mouseover и mouseout
    nodes.on('mouseover', overBubble).on('mouseout', outOfBubble);

    
    // Part 1 - передать данные в симуляцию и добавить обработчик события tick
    function ticked() {
        nodes.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    simulation.nodes(data).on("tick", ticked);

    
    // Part 1 - Создать шаблон при помощи d3.pie() на основе ratings
    var ratings_sample = d3.pie()
        //.value(ratings); //?
        .value(d => d.value );
    
    // Part 1 - Создать генератор арок при помощи d3.arc()
    var arc = d3.arc()
        .innerRadius(150) // it'll be donut chart
        .outerRadius(250)
        .padAngle(0.02)
        .cornerRadius(5);
    
    // Part 1 - построить donut chart внутри donut
    donut.selectAll('path')
        .data(ratings_sample(ratings))
        .enter().append('path')
        .attr('d', arc) // каждый элемент будет передан в генератор
        .attr('fill', d => color(d.data.key))
        .style("opacity", 1) //для лучшей разницы
        .on('mouseover', overArc) // добавляем обработчики событий mouseover и mouseout
        .on('mouseout', outOfArc);

    /*var currentElement = null;

    document.addEventListener('mouseover', function (e) {
        currentElement = e.target;
    });*/

    function overBubble(d){
        console.log(d)
        // Part 2 - задать stroke и stroke-width для выделяемого элемента   
        /*bubble
        .selectAll('circle').querySelectorAll( ":hover" )*/
        d3.select(this)
            .attr('stroke', '#1c1c1c')
            .attr('stroke-width', 1.5);
        
        // Part 3 - обновить содержимое tooltip с использованием классов title и year
        d3.select('.tooltip').html(d.title + "<br>" + d['release year'])
        // Part 3 - изменить display и позицию tooltip
            .style("left", (d3.event.pageX+0.5*radius(d['user rating score']))+ "px") //eturns the horizontal coordinate of the event relative to the whole document.
            .style("top", (d3.event.pageY+0.5*radius(d['user rating score'])) + "px")
            .style('display',"block");

        
        // ..
    }
    function outOfBubble(){
        // Part 2 - сбросить stroke и stroke-width
        d3.select(this)
            .attr('stroke', '')
            .attr('stroke-width', '');
            
        // Part 3 - изменить display у tooltip
        tooltip.style('display', 'none');
    }

    function overArc(d){
        console.log(d)
        // Part 2 - изменить содержимое donut_lable
        //alert(d.data)
        donut_lable.text(d.data.key);


        // Part 2 - изменить opacity арки
        d3.select(this)
            .style('opacity', 0.5);

        // Part 3 - изменить opacity, stroke и stroke-width для circles в зависимости от rating
        // pale all
        nodes.style('opacity', 0.2)

        bubble.selectAll('circle')
            .filter((dd, i) => dd.rating == d.data.key)
            .style('opacity', 1)
            .style("stroke", "black");
    }
    function outOfArc(){
        // Part 2 - изменить содержимое donut_lable
        donut_lable.text('');

        // Part 2 - изменить opacity арки
        d3.select(this)
            .style('opacity', 1);

        // Part 3 - вернуть opacity, stroke и stroke-width для circles
        nodes.style('opacity', 1)
            .attr('stroke-width', 0);
    }
});
