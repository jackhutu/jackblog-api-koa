FROM       jackhu/jenkins-deploy-nodejs:8
MAINTAINER Jack Hu <hello@jackhu.top>

EXPOSE  8800

CMD ["npm","run","pm2-start"]