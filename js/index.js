


function updateDropdownVertices(nodes, select) {

  select.html("");
  let firstOption = new Option("selecione vértice", "");
  $(firstOption).attr("disabled", "disabled");
  $(firstOption).attr("selected", "selected");
  select.append(firstOption);
  nodes.forEach(n => {
    select.append(new Option(n.label, n.id));
  });

}

function onSelectVertice(e) {
  const valor = $(e.target).val();
  const selectVertice2 = $("#select-vertice-2");

  if (valor == "") {
    selectVertice2.attr("disabled", "true");
    return;
  }

  debugger;

  updateDropdownVertices(nodes, selectVertice2);
  selectVertice2.find(`option[value=${valor}]`).remove();

  if (edges) {
    edgesFromSelectedVertice = edges.get({
      filter: (e => {
        return e.from == valor || e.to == valor;
      })
    });

    edgesFromSelectedVertice.forEach(e => {
      selectVertice2.find(`option[value=${e.to == valor ? e.from : e.to}]`).remove();
    });
  }

  selectVertice2.removeAttr("disabled");
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


function visitar(nodeId) {
  let edges = getUnvisitedEdges(nodeId);
  let caminho = [];
  let currentNode = nodes.get(nodeId);

  nodes.update({ ...currentNode, visited: true });

  if (currentNode)
    caminho.push({
      type: 'node',
      id: currentNode.id
    })

  edges.sort(function (a, b) {
    return parseInt(a.label) - parseInt(b.label);
  });

  //for (let i = 0; i < edges.length; i++) {
  if (edges.length) {
    let nextNodeId = edges[0].to == currentNode.id ? edges[0].from : edges[0].to;

    if (!nodes.get(nextNodeId).visited) {
      caminho.push({
        type: 'edge',
        id: edges[0].id
      })
    }
    //}

    caminho = caminho.concat(visitar(nextNodeId));
  }
  return caminho;
}

function getUnvisitedEdges(nodeId) {
  const connectedEdgesIds = network.getConnectedEdges(nodeId);
  let connectedEdges = [];

  connectedEdgesIds.forEach(cei => {
    let edge = edges.get(cei);
    if (!nodes.get(edge.to == nodeId ? edge.from : edge.to).visited) {
      connectedEdges.push(edge);
    }
  });

  return connectedEdges;
}

let edges = null;
let nodes = null;
let network = null;


$(function () {
  // create an array with nodes
  let lastId = 0;
  var nodesArray = [
    // { id: 1, visited: false, label: "1" },
    // { id: 2, visited: false, label: "2" },
    // { id: 3, visited: false, label: "3" },
    // { id: 4, visited: false, label: "4" },
    // { id: 5, visited: false, label: "5" }
  ];

  var edgesArray = [
    // { from: 1, to: 2, label: "1" },
    // { from: 2, to: 3, label: "2" },
    // { from: 3, to: 4, label: "3" },
    // { from: 4, to: 5, label: "4" },
    // { from: 4, to: 2, label: "2" },
    // { from: 4, to: 1, label: "7" },
  ];
  // create an array with edges
  edges = new vis.DataSet(edgesArray);
  nodes = new vis.DataSet(nodesArray);

  // create a network
  var container = document.getElementById("mynetwork");
  var data = {
    nodes: nodes,
    edges: edges,
  };
  var options = {};
  options.nodes = {
    color: 'green'
  }

  options.edges = {
    color: {
      inherit: false
    }
  }
  options.height = Math.round($(window).height() * 0.95) + 'px';
  network = new vis.Network(container, data, options);
  updateDropdownVertices(nodes, $(".select-vertice"));
  $("#btn-add-vertice").click((ev) => {
    let label = $(".lbl-vertice").val();
    nodes.add({ id: ++lastId, label: label.length ? label : lastId.toString(), visited: false });
    $(".lbl-vertice").val("");
  });

  $("#form-edge").submit((ev) => {
    ev.preventDefault();
    let label = $(".lbl-vertice").val();
    const vertice1 = parseInt($("#select-vertice-1").val());
    const vertice2 = parseInt($("#select-vertice-2").val());
    const peso = $("#input-peso").val();
    edges.add({ from: vertice1, to: vertice2, label: peso });
    $("#input-peso").val("");
    $("#select-vertice-1").val("");
    $("#select-vertice-2").val("")

  });

  nodes.on('add', e => {
    updateDropdownVertices(nodes, $(".select-vertice"));
  });

  $("#select-vertice-1").on('change', onSelectVertice);

  $("#form-visualizacao").submit((ev) => {
    ev.preventDefault();

    let res = visitar($("#select-vertice-inicial").val(), {});
    let i = 0;

    $(".btn-reiniciar-col").show();
    $(".btn-vertice-inicial-col, .vertice-inicial-col").hide();
    res.forEach((obj) => {

      if (obj.type == 'node') {
        let node = nodes.get(obj.id);
        setTimeout(() => { 
          nodes.update({ ...node, color: 'red' });
          debugger;
          $("#result").html($("#result").html() + `${node.id} `);
        
        }, 500 + 1000 * (i));
      } else if (obj.type == 'edge') {
        let edge = edges.get(obj.id);
        setTimeout(() => { 
          edges.update({ ...edge, width: 5, color: { color: 'blue' } });
          $("#result").html($("#result").html() + "-> ");
        }, 1000 + 1000 * (i));
      }

      i++;
    });

  });

  $("#btn-reiniciar").click(ev => {

    $(".btn-reiniciar-col").hide();
    $(".btn-vertice-inicial-col, .vertice-inicial-col").show();
    $("#result").html("");
    nodes.forEach(n => {
      nodes.update({ ...n, color: 'green', visited: false });
    });

    edges.forEach(e => {
      edges.update({ ...e, width: 1, color: {color: 'gray'} });
    });

  });

})