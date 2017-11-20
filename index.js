$(document).ready(function(){
 
    // Responsive svg 
    let width = window.innerWidth,
        height = window.innerHeight;
    let svg = d3.select("body").select("div.main").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox","0 0 " + Math.min(width, height) + " " + Math.min(width,height))
        .attr("preserveAspectRatio","xMinYMin")
        ;

    // Number of balls
    let num_balls = 20;

    // Diameter of the ground
    let d = 200;

    // Ball size
    let w = 20;

    // Number of ball pairs (how many clicks to log) per test
    let pairs_per_test = 10;

    // Colors
    let default_color = "grey";
    let highlight_color = "red";

    // Generate an array of integers from 1 to num_balls.
    // Also calculate the position of each ball.
    // Should have been done using lambda function...
    let id_list = [];
    let ball_pos = [];

    // One test
    function run(num_balls, d, w) {
        console.log("Number of balls: ", num_balls, "\nDistance: ", d, "\nTarget size: ", w);

        // Put the elements in place
        function init(num_balls, d, w) {
            id_list = [];
            ball_pos = [];

            for (i = 0; i < num_balls; i++) {
                id_list[i] = i;
                ball_pos[i] = {
                    x: d * Math.cos(2 * Math.PI * (i-1) / num_balls),
                    y: d * Math.sin(2 * Math.PI * (i-1) / num_balls)
                }
            }

            // The circular ground where the balls are put at
            let g = svg.append("g")
                .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
                ;

            // Put the balls into place
            id_list.forEach(function(i) {
                g.append("circle")
                    .attr("r", w)
                    .attr("fill", default_color)
                    .attr("fill-opacity", 0.6)
                    .attr("transform", "translate(" 
                        + ball_pos[i].x + "," 
                        + ball_pos[i].y + ")")
                    .attr("id", "circle_" + i)
                    ;
            })
        }

        // When a ball is picked, change it to red and set it as clickable
        function highlight(ball_id) {
            d3.select("#circle_" + ball_id)
                .attr("fill", highlight_color)
                .on("click", function(d,i) { dehighlight(ball_id); })
                ;
        }

        // When clicked, remove the color and the onclick event
        function dehighlight(ball_id) {
            d3.select("#circle_" + ball_id)
                .attr("fill", default_color)
                .on("click",function(d,i) { return false; })
                ;
        }

        // Set up the playground
        init(num_balls, d, w);
        pairs_per_test = 10;
        let clicks_per_pair = 2;
        let timer = 0;

        // Pick a random ball to highlight
        let id = Math.floor(Math.random() * num_balls);
        highlight(id);

        // Wait for click events
        $(document).click(function(e) {

            // Since the balls use the screen center as (0, 0) while mouse
            // events use the top left of the screen as (0, 0), we need to
            // relocate the mouse event.
            let click_location = { x: e.pageX - width/2, y:e.pageY - height/2 };

            // Calculate the distance of the click event to the center of the
            // current ball.
            let distance_to_ball_center = Math.sqrt( 
                (ball_pos[id].x - click_location.x) * (ball_pos[id].x - click_location.x) + 
                (ball_pos[id].y - click_location.y) * (ball_pos[id].y - click_location.y)
            );

            // Only log clicks on the currently highlighted ball.
            if (distance_to_ball_center < w) {
                clicks_per_pair--;
                dehighlight(id);

                // Move to the opposite ball if we are not done with the pair.
                // Otherwise, random another ball.
                if (clicks_per_pair == 1) {
                    id = (Math.floor(num_balls/2) + id) % num_balls;
                    timer = Date.now();
                } else {
                    console.log(Date.now() - timer, ball_pos[id], click_location);
                    clicks_per_pair = 2;

                    // Avoid duplicate
                    let curr_id = id;
                    while (id == curr_id || id == (Math.floor(num_balls/2) + id) % num_balls) 
                        id = Math.floor(Math.random() * num_balls);

                    // Check if the current test is done.
                    pairs_per_test--;
                    if (pairs_per_test == 0) return;
                }
                
                highlight(id);
            }
        });
    }

    // MAIN
    num_balls = 20;
    d = 200;
    w = 20;
    run(num_balls, d, w);
});
