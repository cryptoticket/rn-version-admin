PROJECT ?= rn-version-admin
# your username from hub.docker.com or your custom docker hub url(ex: custom-docker-hub.com)
HUB ?= 

# run locally
.PHONY: docker-run
docker-run:
	docker build -t $(PROJECT):latest -f $(CURDIR)/devops/Dockerfile $(CURDIR)
	docker run --network="host" -i --rm -v $(CURDIR):/app $(PROJECT):latest *

# upload to hub
.PHONY: docker-hub-upload
docker-hub-upload:
	docker build -t $(PROJECT):latest -f $(CURDIR)/devops/Dockerfile $(CURDIR)
	docker tag $(PROJECT):latest $(HUB)/$(PROJECT):latest
	docker push $(HUB)/$(PROJECT):latest
