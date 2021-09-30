# script for deploying new contract each round
import sys
import os # used to access environment variable, maybe open a file instead?
from brownie import network, Contract

network.connect('xdai-main')
network.accounts.add(sys.argv[1])
factory = Contract.from_explorer('') #contract.from_ABI if this doesn't work
factory.newRound(os.environ.get('CURRENT_ROUND_ADDRESS') ,{from: accounts[-1]})