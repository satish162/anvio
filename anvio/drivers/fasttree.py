# coding: utf-8
"""Interface to FastTree."""

import os
import io
from subprocess import Popen, PIPE

import anvio
import anvio.utils as utils
import anvio.terminal as terminal
import anvio.filesnpaths as filesnpaths
from anvio.fastalib import ReadFasta

from anvio.errors import ConfigError


__author__ = "Özcan Esen"
__copyright__ = "Copyright 2017, The anvio Project"
__credits__ = []
__license__ = "GPL 3.0"
__version__ = anvio.__version__
__maintainer__ = "Özcan Esen"
__email__ = "ozcanesen@gmail.com"


run = terminal.Run()
progress = terminal.Progress()
pp = terminal.pretty_print


class FastTree:
    def __init__(self):
        self.run = run
        self.progress = progress
        self.command = ['FastTree']

        utils.is_program_exists('FastTree')

    def run_command(self, input_file_path, output_file_path):
        input_file_path = os.path.abspath(input_file_path)
        filesnpaths.is_file_fasta_formatted(input_file_path)

        output_file_path = os.path.abspath(output_file_path)
        filesnpaths.is_output_file_writable(output_file_path)

        run.info("Input aligment file path", input_file_path)
        run.info("Output file path", output_file_path)

        alignments = ReadFasta(input_file_path, quiet=True)
        run.info("Alignment names", ", ".join(alignments.ids))

        alignment_lengths = map(len, alignments.sequences)
        if len(set(alignment_lengths)) == 1:
            run.info("Alignment sequence length", alignment_lengths[0])
        else:
            raise ConfigError("Alignment lengths are not equal in input file.")

        input_file = open(input_file_path, 'rb')

        fasttree = Popen(self.command, stdout=PIPE, stdin=PIPE, stderr=PIPE)
        output = fasttree.communicate(input=input_file.read())
        input_file.close()
        
        output_stdout = output[0].decode().rstrip()
        output_stderr = output[1].decode().splitlines()

        run.info("Version", output_stderr[0])
        for line in output_stderr[1:]:
            line = line.split(":")
            if len(line) == 2:
                run.info(line[0], line[1].strip())
            else:
                run.info("Info", ":".join(line))
        
        if filesnpaths.is_proper_newick(output_stdout):
            output_file = open(output_file_path, 'w')
            output_file.write(output_stdout)
            output_file.close()