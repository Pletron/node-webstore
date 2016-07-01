# Makefile - Makefile to create a Docker image.
# Copyright (C) 2016 Philip Masek
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

INSTALLATION_DIR=/usr/src/app
PRODUCT=$(shell cat app/package.json | grep \"name\" | sed -e "s/.*: //g" -e "s/\"//g" -e "s/,//g")
DOCKERHUB=pletron
VERSION=$(shell cat app/package.json | grep \"version\" | sed -e "s/.*: //g" -e "s/\"//g" -e "s/,//g")


all: build-img install commit
reall: rebuild commit


build-img:
	docker build -t $(PRODUCT):$(VERSION) -f $(PWD)/Dockerfile .

install:
	docker run --name install_container -v $(PWD)/app:$(INSTALLATION_DIR) -w $(INSTALLATION_DIR) $(PRODUCT):$(VERSION) npm install

commit:
	docker commit install_container $(PRODUCT):$(VERSION) && docker rm install_container

tag-latest-image:
	docker tag $(PRODUCT):$(VERSION) $(PRODUCT):latest

push: tag-latest-image
	docker push $(DOCKERHUB)/$(PRODUCT):latest