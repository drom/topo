'use strict';

const lib = require('./');

const getDiv = div => {
  if (typeof div === 'object') { return div; }
  return document.getElementById(div);
};

global.MAIN = div => {
  div = getDiv(div);
  lib.topo(div, {
    children: [
      {id: 'n1', width: 10, height: 10, ports: [
        {id: 'n1_i0', width: 2, height: 2},
        {id: 'n1_i1', width: 2, height: 2}
      ]},
      {id: 'n2', width: 8, height: 6, ports: [
        {id: 'n2_t0', width: 2, height: 2}
      ]},
      {id: 'n3', width: 8, height: 6, ports: [
        {id: 'n3_t0', width: 2, height: 2}
      ], children: [
        {
          id: 'n4', width: 8, height: 4,
          ports: [
            {id: 'n4_t0', width: 2, height: 2}
          ]
        }
      ], edges: [
        {id: 'e3', sources: ['n3_t0'], targets: ['n4_t0']}
      ]}
    ],
    edges: [
      {id: 'e1', sources: ['n1_i0'], targets: ['n2_t0']},
      {id: 'e2', sources: ['n1_i1'], targets: ['n3_t0']}
    ]
  });
};

/* eslint-env browser */
