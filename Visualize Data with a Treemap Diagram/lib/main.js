class Chart {
    /**
     * @description Creates a new Chart and creates a body reference and svg reference
     * sets width and height to 0
     */
    constructor() {
        this.body = d3.select("body");
        this.svg = d3.select("#tree-map");
        this.width = 0;
        this.height = 0;
    }

    /** 
     * @function createTooltip
     * @description appends a div with the class tooltip and an id tooltip. it sets opacity to 0 so its not visible  
     */
    createTooltip() {

        this.body.append("div")
            .attr("class", "tooltip").
        attr("id", "tooltip")
            .style("opacity", 0);
    }

    /** 
     * @function setupSvg 
     * @description sets the height and width from the svg size
     */
    setupSvg() {

        this.width = +this.svg.attr("width");
        this.height = +this.svg.attr("height");

    }

    /** 
     * @function buildChart 
     * @description Runs createTooltip() and setupSvg()
     */
    buildChart() {
        this.createTooltip();
        this.setupSvg();
    }
}


class Legend {
    /**
     * @description  Creates a new Legend.
     * @param  {array} categories
     * @param  {number} legendOffset
     * @param  {number} legendRectSize
     * @param  {number} LegendHorizontalSpacing
     * @param  {number} LegendVerticalSpacing
     * @param  {number} legendTextXaxisOffset
     * @param  {number} legendTextYaxisOffset
     */
    constructor(categories,
            legendOffset,
            legendRectSize,
            LegendHorizontalSpacing,
            LegendVerticalSpacing, legendTextXaxisOffset, legendTextYaxisOffset) {

            this.color;
            this.categories = categories;
            this.legendElem = 'null';
            this.legend = d3.select("#legend")
            this.legendWidth = +this.legend.attr("width");
            this.legendOffset = legendOffset;
            this.legendRectSize = legendRectSize;
            this.LegendHorizontalSpacing = LegendHorizontalSpacing;
            this.LegendVerticalSpacing = LegendVerticalSpacing;
            this.legendTextXaxisOffset = legendTextXaxisOffset;
            this.legendTextYaxisOffset = legendTextYaxisOffset;
            this.legendElemsPerRow = Math.floor(this.legendWidth / this.LegendHorizontalSpacing);

        }
        /** 
         * @function createLegendText 
         * @description places texts inside the legend rect
         */
    createLegendText() {

            this.legend
                .append("text")
                .attr('fill', 'white')
                .attr('x', this.legendRectSize + this.legendTextXaxisOffset)
                .attr('y', this.legendRectSize + this.legendTextYaxisOffset)
                .text((d) => {
                    return d;
                });
        }
        /** 
         * @function createLegend 
         * @description creates the legendand appends the data 
         */
    createLegend() {
            this.legend = this.legend
                .append("g")
                .attr("transform", "translate(60," + this.legendOffset + ")")
                .selectAll("g")
                .data(this.categories)
                .enter().append("g")
                .attr("transform", (d, i) => {
                    return 'translate(' +
                        ((i % this.legendElemsPerRow) * this.LegendHorizontalSpacing) + ',' +
                        ((Math.floor(i / this.legendElemsPerRow)) * this.legendRectSize + (this.LegendVerticalSpacing * (Math.floor(i / this.legendElemsPerRow)))) + ')';
                })
        }
        /** 
         * @function createRect 
         * @description creates a rect, based on the predefined rect sizes for height and width.
         * Adds a class legend-item which can be styled. The rect is filled with a color
         * using d3.interpolateRgb
         */
    createRect() {

        const fader = (color) => {
            return d3.interpolateRgb(color, "#f2f")(0.2);
        }

        var color = d3.scaleOrdinal(d3.schemeCategory20.map(fader))

        this.legend
            .append("rect")
            .attr('width', this.legendRectSize)
            .attr('height', this.legendRectSize)
            .attr('class', 'legend-item')
            .attr('fill', (d) => {
                return color(d);
            })

        this.legend.append("rect")
            .attr('width', this.legendRectSize)
            .attr('height', this.legendRectSize)
            .attr('class', 'legend-item')
            .attr('fill', (d) => {
                return color(d);
            });
    }

    /** 
     * @function setupLegend 
     * @description Runs createLegend(), createRect() and createLegendText()
     */
    setupLegend() {

        this.createLegend();
        this.createRect();
        this.createLegendText();

    }

}


class TreeDiagram {
    /**
     * @description Creates a new TreeDiagram.
     * @param  {object} data
     * @param  {HTMLHtmlElement} svg
     */
    constructor(data, svg) {
            this.root;
            this.cell;
            this.data = data;
            this.treemap;
            this.svg = svg;
            this.color;
            this.tile;
            console.log(this.svg);
        }
        /**
         * @function createRoot()
         * @description creates a treemap of size 900 600
         * creates a root  and sums up data and sorts the trees left and right values
         */
    createRoot() {

            const treemap = d3.treemap().size([1080, 970]).paddingInner(1);

            this.root = d3.hierarchy(this.data).eachBefore((d) => {
                    d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
                })
                .sum((d) => {
                    return d.value;
                })
                .sort((a, b) => {
                    return b.height - a.height || b.value - a.value;
                });

            treemap(this.root);

        }
        /**
         * @function createCell()
         * @description creates cells from the tree leaves, 
         * adds class of group and transform x and y coords.
         * Then appends text to the cell
         */
    createCell() {

            this.cell = this.svg.selectAll("g")
                .data(this.root.leaves())
                .enter()
                .append("g")
                .attr("class", "group")
                .attr("transform", (d) => {
                    return "translate(" + d.x0 + "," + d.y0 + ")";
                });

            this.cell.append("text")
                .attr('class', 'tile-text')
                .selectAll("tspan")
                .data((d) => {
                    return d.data.name.split(/(?=[A-Z][^A-Z])/g);
                })
                .enter()
                .append("tspan")
                .attr('fill', 'white')
                .attr("x", 4)
                .attr("y", function(d, i) {
                    return 10 + i * 10;
                }).text(function(d) {
                    return d;
                });
        }
        /**
         * @function createTile
         * @description creates a tile by adding attributes 
         * css class of tile, dataname, 
         * data category and data value.
         * Then fills each tile with a color based on category
         * Appends text to the tile
         * Creates a tooltip entry when hoovered over
         */
    createTile() {

        const fader = (color) => {
            return d3.interpolateRgb(color, "#f2f")(0.2);
        }
        const color = d3.scaleOrdinal(d3.schemeCategory20.map(fader));


        this.tile = this.cell.append("rect")
            .attr("id", (d) => {
                return d.data.id;
            }).attr("class", "tile").attr("width", (d) => {
                return d.x1 - d.x0;
            }).attr("height", (d) => {
                return d.y1 - d.y0;
            }).attr("data-name", (d) => {
                return d.data.name;
            }).attr("data-category", (d) => {
                return d.data.category;
            }).attr("data-value", (d) => {
                return d.data.value;
            }).attr("fill", (d) => {
                return color(d.data.category);
            });


        // aqui
        this.cell.append("text")
            .attr('class', 'tile-text')
            .selectAll("tspan").data((d) => {
                return d.data.name.split(/(?=[A-Z][^A-Z])/g);
            }).enter()
            .append("tspan")
            .attr("x", 4)
            .attr("y", (d, i) => {
                return 13 + i * 10;
            }).text((d) => {
                return d;
            });

        var tooltip = d3.select("#tooltip");

        this.cell.on("mousemove", (d) => {
                tooltip.style("opacity", .9);
                tooltip.html(
                        'Name: ' + d.data.name +
                        '<br>Category: ' + d.data.category +
                        '<br>Value: ' + d.data.value
                    )
                    .attr("data-value", d.data.value)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", (d) => {
                tooltip.style("opacity", 0);
            })

    }

    /**
     * @function setup
     * @description Calls createRoot(),
     * createCell(),
     * createTile()
     */
    setup() {

        this.createRoot();
        this.createCell();
        this.createTile();

    }

}


class DataSet {
    /**
     * @description Creates a new DataSet.
     * @param  {string} title
     * @param  {string} description
     * @param  {string} filePath
     */
    constructor(title, description, filePath) {

        this.title = title;
        this.description = description;
        this.filePath = filePath;
    }

}

/**
 * Creates a new Project.
 * @class Project
 * @description Creates a new chart, empty dataSet to be populated and the default data to load
 */
class Project {

    constructor() {
            this.Chart = new Chart();
            this.dataSets = {};
            this.defaultData = "Video Game Sales";
        }
        /**
         * @function createData
         * @param  {array} dataArr
         * @description converts json data to an object:DICT with the data title being the key
         */
    createData(dataArr) {

            dataArr.forEach(element => {
                this.dataSets[element.title] = element;
            });

        }
        /**
         * @function getData
         * @description Accesses the url param and looks for data=
         * then uses this to access dataset via this key. If it cant be found or hasnt been added it looks for the default
         */
    getData() {

        // get the search value 
        // E.g /data=Kickstarter Pledges
        var urlParams = new URLSearchParams(window.location.search);

        // get the data value 
        // E.g data=Kickstarter Pledges
        // = Kickstarter Pledges
        return this.dataSets[urlParams.get('data') || this.defaultData];
    }

    /**
     * @function updateDOM
     * @param {object} DATASET 
     * @description sets the title and description on the webpage 
     */
    updateDOM(DATASET) {
            document.getElementById("title").innerHTML = DATASET.title;
            document.getElementById("description").innerHTML = DATASET.description;
        }
        /**
         * @function init
         * @param  {object} dataArr
         * @description builds the chart and creates the data
         */
    init(dataArr) {

            this.Chart.buildChart();
            this.createData(dataArr);

        }
        /**
         * @function run
         * @description gets the data and updates the dom
         * Retrieves the dataset via d3.json 
         * creates a root tree and filters catergories,
         * creates treeDiagram and legend
         */
    run() {

        const DATASET = this.getData();

        //update UI
        this.updateDOM(DATASET);



        d3.json(DATASET.filePath, (error, data) => {

            if (error) throw error;


            /**
             * @description 
             * Creates a tree structure parent and children 
             * EXPLAIN
             * for More info https://www.d3indepth.com/layouts/ 
             */

            var root = d3.hierarchy(data).eachBefore((d) => {
                d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
            }).sum((d) => {
                return d.value;
            }).sort(function(a, b) {
                return b.height - a.height || b.value - a.value;
            });

            // root.leaves() allows us to access the children 
            // then map over to access the datas catergory
            var categories = root.leaves().map((nodes) => {
                return nodes.data.category;
            });


            // filter it
            categories = categories.filter((category, index, self) => {
                return self.indexOf(category) === index;
            });

            // create tree
            const tree = new TreeDiagram(data, this.Chart.svg);
            tree.setup();

            // create legend
            var legend = new Legend(categories, 10, 15, 150, 10, 3, -2);
            legend.setupLegend();

        });
    }
}

let p = new Project();

let videogames = new DataSet("Video Game Sales",
    "Top 100 Most Sold Video Games Grouped by Platform",
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json");
let movies = new DataSet("Movie Sales",
    "Top 100 Highest Grossing Movies Grouped By Genre",
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json");
let kickstarter = new DataSet("Kickstarter Pledges",
    "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json");


p.init([videogames, movies, kickstarter]);
p.run();