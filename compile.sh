#!/bin/sh
cd interfaces
npm i
npm pack
cd ..
cd core
npm i
npm pack
cd ..
cd back-end
npm i
npm i ../interfaces/interfaces-1.0.0.tgz
npm i ../core/core-1.0.0.tgz
npm pack
cd ..

