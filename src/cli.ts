#!/usr/bin/env node
import * as commander from 'commander';
import {translate} from './main';

const program = new commander.Command();

program
  .version('0.0.1') //版本
  .name('translate') //名称
  .usage('<English>') //<>必选
  .arguments('<English>')
  .action(function (english){
    translate(english)
  })
program.parse(process.argv);// 参数解析