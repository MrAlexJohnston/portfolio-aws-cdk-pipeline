#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { PortfolioAwsCdkPipelineStack } from '../lib/portfolio-aws-cdk-pipeline-stack'

const app = new cdk.App()
new PortfolioAwsCdkPipelineStack(app, 'PortfolioAwsCdkPipelineStack', {})
