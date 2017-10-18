use utf8;
use strict;
use Storable;
use Data::Printer;
use JSON;
use List::Util qw(first);

my $in_filename = qq`clues2.txt`;
my $out_filename = qq`../www/data/answers_length_by_letter_hash.json`;

my @LINE;
my $clue;
my $answer;
my $ans_len;
my %ANSWERS_HASH;

open(FILE, "<$in_filename") or die "Can't open clues2.txt: $!\n";

my $count = 0;	
while (<FILE>) { 
	@LINE = split("%%%%%",$_);
	foreach my $line (@LINE) {
		($clue) = $line =~ m`^(.*?),,`;
		if ($clue =~ m`[a-z]`i) {
			($answer) = $line =~ m`,,(.*?)$`;
			$ans_len = length($answer);
			
			#we can only use words over 2 letters long
			if (int($ans_len) > 2) {
				my @letters = split ('',$answer);
				my $word;
				foreach my $letter (@letters) {
					$word .= $letter;
					push @{ $ANSWERS_HASH{$ans_len}{$word} }, $answer;
				}
			}
		}
		#$count++;
		#print $count."\n";
		#if ($count eq 100) {
		#	print "foreach\n";
		#	last;
		#}
	}
	#if ($count eq 100) {
	#	print "while\n";
	#	last;
	#}
}
close (FILE);

#p %ANSWERS_HASH;
open(FILE, ">$out_filename") or die "Can't open $out_filename: $!\n";
print FILE JSON->new->pretty->encode(\%ANSWERS_HASH);
close(FILE);
print "answers_hash_creator = fin\n";