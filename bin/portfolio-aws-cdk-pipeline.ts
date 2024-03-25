#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { PortfolioAwsCdkPipelineStack } from '../lib/portfolio-aws-cdk-pipeline-stack'
import cdkReposData from '../lib/cdk-repos.json' // Adjust the path as necessary

interface RepoInfo {
  branch: string
  repo: string
  owner: string
}
const cdkRepos: RepoInfo[] = cdkReposData

const app = new cdk.App()
cdkRepos.forEach((repoInfo) => {
  const { repo } = repoInfo
  const stackName = restructureRepo(repo)
  new PortfolioAwsCdkPipelineStack(app, stackName, repoInfo)
})

function restructureRepo (repo: string): string {
  return repo.split('-')
    .map(string => string.charAt(0).toUpperCase() + string.slice(1))
    .join('')
}
