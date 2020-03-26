PROJECT ?= rn-version-admin
# your username from hub.docker.com or your custom docker hub url(ex: custom-docker-hub.com)
HUB ?= 
# build postfix, examples: "/develop", "/stage", "/master", etc...
BUILD_POSTFIX ?=

# run locally
.PHONY: docker-run
docker-run:
	docker build -t $(PROJECT)$(BUILD_POSTFIX):latest -f $(CURDIR)/devops/Dockerfile $(CURDIR)
	docker run --network="host" -i --rm -v $(CURDIR):/app $(PROJECT)$(BUILD_POSTFIX):latest *

# upload to hub
.PHONY: docker-hub-upload
docker-hub-upload:
	docker build -t $(PROJECT)$(BUILD_POSTFIX):latest -f $(CURDIR)/devops/Dockerfile $(CURDIR)
	docker tag $(PROJECT)$(BUILD_POSTFIX):latest $(HUB)/$(PROJECT)$(BUILD_POSTFIX):latest
	docker push $(HUB)/$(PROJECT)$(BUILD_POSTFIX):latest
