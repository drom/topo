'use strict';

const ELK = require('elkjs');
const onml = require('onml');

const grid = (w, h, dx, dy) => {
  const res = ['g', onml.tt(-1, -1, {class: 'topo-grid'})];
  for (let x = 0; x <= w; x += dx) {
    for (let y = 0; y <= h; y += dy) {
      res.push(['rect', {x, y}]);
    }
  }
  return res;
};

const scaler = (numerator, denominator) =>
  function () {
    const res = [];
    for (let i = 0; i < arguments.length; i++) {
      res.push(Math.round(arguments[i] / denominator) * numerator);
    }
    return res;
  };

const scale = scaler(4, .5);

const scaled = (d, sx, sy) => {
  const xscale = idx => d[idx] = Math.round(d[idx]) * sx;
  const yscale = idx => d[idx] = Math.round(d[idx]) * sy;

  if (sy === undefined) { sy = sx; }
  let i = 0;
  while (i < d.length) {
    switch (d[i]) {
    case 'h':
    case 'H':
      xscale(i + 1); i++; break;
    case 'v':
    case 'V':
      yscale(i + 1); i++; break;
    case 'm':
    case 'l':
    case 'M':
    case 'L':
      xscale(i + 1); yscale(i + 2); i += 2; break;
    case 'a':
      xscale(i + 1); yscale(i + 2); xscale(i + 6); yscale(i + 7); i += 7; break;
    }
    i++;
  }
  return d;
};

const drawEdge = e =>
  (e.sections || []).map(s => {
    const d = [
      'M', s.startPoint.x, s.startPoint.y,
      ...(s.bendPoints || []).flatMap(e =>
        ['L', e.x, e.y]
      ),
      'L', s.endPoint.x, s.endPoint.y
    ];
    return ['path', {d: scaled(d, 8, 8).join(' ')}];
  });

const drawPort = p => {
  const [x, y, width, height] = scale(p.x, p.y, p.width, p.height);
  return ['rect', {width, height, x, y}];
};

const nodes = n => {
  console.log(n);
  const [x, y, width, height] = scale(n.x, n.y, n.width, n.height);
  const res = ['g', onml.tt(x, y, {class: 'topo-node', width, height}),
    ['rect', {width, height}],
    ['g', {class: 'topo-edge'}, ...(n.edges || []).flatMap(drawEdge)],
    ['g', {class: 'topo-port'}, ...(n.ports || []).map(drawPort)],
    ...(n.children || []).map(nodes)
  ];
  return res;
};

const draw = desc => {
  const body = nodes(desc);
  const {width, height} = body[1];
  const svg = onml.gen.svg(width, height);
  svg.push(
    grid(width, height, 8, 8),
    body
  );
  return svg;
};

const renderer = div => {
  const rend = onml.renderer(div);
  return ml => {
    rend(ml);
  };
};

const makeNodes = desc => desc.children;

const makeEdges = desc => desc.edges;

const makeGraph = desc => {
  return {
    id: 'root',
    layoutOptions: {
      algorithm: 'layered',
      spacing: 1,
      // 'elk.direction': 'DOWN', // ( UNDEFINED RIGHT LEFT DOWN UP ) https://www.eclipse.org/elk/reference/options/org-eclipse-elk-direction.html
      // spacing: https://www.eclipse.org/elk/reference/groups/org-eclipse-elk-spacing.html
      'spacing.commentNode': 4,
      // 'spacing.componentComponent': 4,
      // 'spacing.edgeEdge': 4,
      // 'spacing.edgeNode': 16,
      'spacing.nodeNode': 4, // vertical gap between nodes
      'spacing.nodeSelfLoop': 4,
      'spacing.portPort': 4,

      // 'spacing.edgeEdgeBetweenLayers': 4,
      'spacing.nodeNodeBetweenLayers': 4, // horizontal spacing
      'spacing.edgeNodeBetweenLayers': 4, // horizontal spacing
      'padding': 128,
      // 'nodePlacement.strategy': 'NETWORK_SIMPLEX',
      feedbackEdges: true
    },
    children: makeNodes(desc),
    edges: makeEdges(desc)
  };
};

const topo = async (div, desc) => {
  const render = renderer(div);
  const elk = new ELK();
  const graph = makeGraph(desc);
  const layout = await elk.layout(graph);
  const ml = draw(layout);
  render(ml);
};

exports.topo = topo;
