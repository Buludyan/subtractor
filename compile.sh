#!/bin/sh
cd interfaces
npm run compile
npm pack
cd ..
cd core
npm run compile
npm pack
cd ..
cd back-end
npm uninstall ../interfaces/interfaces-1.0.0.tgz
npm uninstall ../core/core-1.0.0.tgz
npm i ../interfaces/interfaces-1.0.0.tgz
npm i ../core/core-1.0.0.tgz
npm run compile
cd ..

