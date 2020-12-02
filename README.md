# actions-deploy-cage

Github Actions that deploy service with [canarycage](https://github.com/loilo-inc/canarycage)

## Usage

See `action.yml`

Before using action, ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` added to reposiroty secrets.
`secrets.GITHUB_TOKEN` is automatically added within actions.

```yaml
  jobs:
    deploy:
      runs-on: ubuntu-latest
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      steps:
        - uses: actions/checkout@v1
        - uses: loilo-inc/actions-setup-cage@master
        - uses: loilo-inc/actions-deploy-cage@master
          with:
            region: us-west-2
            deploy-context: .deploy/development/your-service
            create-deployment: true
            environment: development
            github-repository: ${{ github.repository }}
            github-token: ${{ env.GITHUB_TOKEN }}
            github-ref: ${{ github.sha }}
```
